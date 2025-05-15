use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::PREDICTION_TOKEN_DECIMALS;
use crate::errors::*;
use crate::state::{GlobalStrategyRegistry, Receipt, StrategyState, Vault};
use crate::utils::{calculate_interest, update_strategy_interest};

pub fn withdraw<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Withdraw<'info>>, strategy_id: u8, amount: u64) -> Result<()> 
where
    'c: 'info,
{
    // 基础验证
    require!(
        amount > 0,
        PredictionMarketError::AmountMustBeGreaterThanZero
    );

    let now = Clock::get()?.unix_timestamp;
    let receipt = &mut ctx.accounts.receipt;
    let vault = &mut ctx.accounts.vault;

    let registry = &ctx.accounts.registry;
    let program_id = ctx.program_id;


    require!(
        ctx.remaining_accounts.len() == registry.strategy_ids.len(),
        PredictionMarketError::InvalidRemainingAccountsLength
    );

    let mut total_interest = 0u64;
    let mut current_strategy_apr = 0;
    let mut current_strategy_used_principal_percent = 0;

    for (index, account) in ctx.remaining_accounts.iter().enumerate() {
        // 验证账户是否属于程序
        require!(
            account.owner == program_id,
            PredictionMarketError::InvalidProgramId
        );

         // 验证账户是否可写
        require!(
            account.is_writable,
            PredictionMarketError::AccountNotWritable
        );

        // 获取策略ID
        let id = registry.strategy_ids[index] as u8;

        // 计算预期的PDA
        let expected_pda = Pubkey::find_program_address(&[b"strategy", &[id]], program_id).0;

        // 验证PDA是否匹配
        require!(
            expected_pda == *account.key,
            PredictionMarketError::InvalidPDA
        );

        let mut strategy = Account::<StrategyState>::try_from(account)?;
        let mut data = account.try_borrow_mut_data()?;

        // 结算策略利息
        let interest = update_strategy_interest(
            strategy.total_principal,
            strategy.apr,
            strategy.last_update_ts,
            now
        );

        msg!("Strategy {} interest: {}", id, interest);

        strategy.total_interest = strategy.total_interest
            .checked_add(interest)
            .ok_or(PredictionMarketError::Overflow)?;
        strategy.last_update_ts = now;

        // 如果是当前策略
        if id == strategy_id {
            current_strategy_apr = strategy.apr;
            current_strategy_used_principal_percent = strategy.used_principal_percent;

            // 更新当前strategy的total_principal和total_user
            strategy.total_principal = strategy.total_principal
                .checked_sub(amount)
                .ok_or(PredictionMarketError::Overflow)?;
            strategy.total_user = strategy.total_user
                .checked_sub(1)
                .ok_or(PredictionMarketError::Overflow)?;
        }

        total_interest = total_interest
            .checked_add(interest)
            .ok_or(PredictionMarketError::Overflow)?;

        strategy.try_serialize(&mut data.as_mut())?;

    }

    // 检查receipt是否有余额
    require!(
        receipt.principal > 0 || receipt.interest > 0,
        PredictionMarketError::NoBalanceToWithdraw
    );

    // 计算并更新利息
    let time_diff = now
        .checked_sub(receipt.last_settle_ts)
        .ok_or(PredictionMarketError::InvalidTimeDiff)?;

    let current_interest = calculate_interest(receipt.principal, time_diff, current_strategy_apr.into());

    receipt.interest = receipt
        .interest
        .checked_add(current_interest)
        .ok_or(PredictionMarketError::Overflow)?;
    receipt.last_settle_ts = now;

    // 检查提取金额是否超过可提取的总额
    let total_available = receipt
        .principal
        .checked_add(receipt.interest)
        .ok_or(PredictionMarketError::Overflow)?;

    require!(
        amount <= total_available,
        PredictionMarketError::WithdrawAmountExceedsBalance
    );

    // 准备签名者种子
    let vault_bump = vault.bump;
    let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    let signer_seeds:&[&[&[u8]]] = &[&vault_seeds[..]];
    

    // 计算实际可提取的金额
    let (actual_principal, actual_interest) =
        calculate_withdrawable_amounts(receipt.principal, receipt.interest, vault.remaining_funds)?;

    // 计算实际提取的总金额
    let total_withdraw = actual_principal
        .checked_add(actual_interest)
        .ok_or(PredictionMarketError::Overflow)?;

    require!(
        total_withdraw > 0,
        PredictionMarketError::NoBalanceToWithdraw
    );

    // 转账USDB
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.vault_usdb_liquidity.to_account_info(),
                to: ctx.accounts.user_usdb.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
                authority: vault.to_account_info(),
            },
            signer_seeds,
        ),
        total_withdraw,
        PREDICTION_TOKEN_DECIMALS,
    )?;

    // 更新全局策略状态
    // 计算需要减少的本金部分
    let principal_to_sub = actual_principal
        .checked_mul(current_strategy_used_principal_percent as u64)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_div(100)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新可用资金
    vault.available_funds = vault
        .available_funds
        .checked_sub(principal_to_sub)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_sub(actual_interest)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新剩余资金
    vault.remaining_funds = vault
        .remaining_funds
        .checked_sub(principal_to_sub)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_sub(actual_interest)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新总本金和总利息
    vault.total_all_principal = vault
        .total_all_principal
        .checked_sub(actual_principal)
        .ok_or(PredictionMarketError::Overflow)?;
    vault.total_all_interest = vault
        .total_all_interest
        .checked_sub(actual_interest)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_add(total_interest)
        .ok_or(PredictionMarketError::Overflow)?;


    // 更新receipt
    receipt.principal = receipt.principal.saturating_sub(actual_principal);

    receipt.interest = receipt.interest.saturating_sub(actual_interest);

    // 记录提取事件
    emit!(WithdrawEvent {
        user: ctx.accounts.user.key(),
        principal: actual_principal,
        interest: actual_interest,
        remaining_principal: receipt.principal,
        remaining_interest: receipt.interest,
        timestamp: now,
    });

    Ok(())
}

// 计算可提取金额的辅助函数
fn calculate_withdrawable_amounts(
    principal: u64,
    interest: u64,
    remaining_funds: u64,
) -> Result<(u64, u64)> {
    let mut remaining = remaining_funds;
    let actual_principal;
    let mut actual_interest = 0;

    // 优先提取本金``
    if remaining >= principal {
        actual_principal = principal;
        remaining = remaining.saturating_sub(principal);
    } else {
        actual_principal = remaining;
        remaining = 0;
    }

    // 如果有剩余资金，再提取利息
    if remaining > 0 && interest > 0 {
        if remaining >= interest {
            actual_interest = interest;
        } else {
            actual_interest = remaining;
        }
    }

    Ok((actual_principal, actual_interest))
}

// // 更新金库状态的辅助函数
// fn update_vault_state(
//     vault: &mut Account<Vault>,
//     strategy:&mut Account<StrategyState>,
//     actual_principal: u64,
//     actual_interest: u64,
//     total_all_interest: u64,
// ) -> Result<()> {
    
//     Ok(())
// }

#[derive(Accounts)]
#[instruction(strategy_id: u8)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        has_one = user,
        seeds = [b"receipt", &strategy_id.to_le_bytes()[..], user.key().as_ref()],
        bump = receipt.bump
    )]
    pub receipt: Account<'info, Receipt>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalStrategyRegistry>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = user,
        token::token_program = token_program,
    )]
    pub user_usdb: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        token::token_program = token_program,
        seeds = [b"liquidity"],
        bump
    )]
    pub vault_usdb_liquidity: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub principal: u64,
    pub interest: u64,
    pub remaining_principal: u64,
    pub remaining_interest: u64,
    pub timestamp: i64,
}
