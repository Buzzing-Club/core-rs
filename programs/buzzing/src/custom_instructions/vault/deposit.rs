use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::PREDICTION_TOKEN_DECIMALS;
use crate::errors::*;
use crate::state::{GlobalStrategyRegistry, Receipt, StrategyState, Vault};
use crate::utils::{calculate_interest, update_strategy_interest};

pub fn deposit<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Deposit<'info>>, strategy_id: u8, amount: u64) -> Result<()>
where
    'c: 'info,
{
    // 基础验证
    require!(
        amount > 0,
        PredictionMarketError::AmountMustBeGreaterThanZero
    );
    require!(
        ctx.accounts.user_usdb.amount >= amount,
        PredictionMarketError::InsufficientBalance
    );

    let now = Clock::get()?.unix_timestamp;
    let receipt = &mut ctx.accounts.receipt;
    let vault = &mut ctx.accounts.vault;

    let registry = &ctx.accounts.registry;
    let program_id = ctx.program_id;


    // require!(
    //     ctx.remaining_accounts.len() == registry.strategy_ids.len(),
    //     PredictionMarketError::InvalidRemainingAccountsLength
    // );

    let mut total_interest = 0u64;
    let mut current_strategy_apr = 0;
    let mut current_strategy_used_principal_percent = 0;

    // for (index, account) in ctx.remaining_accounts.iter().enumerate() {
    for account in ctx.remaining_accounts.iter() {
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

        // 在registry中获取策略ID，传入是账户组和registry中的strategy_ids是对应的
        // let id = registry.strategy_ids[index] as u8;
        
        // // 计算预期的PDA
        // let expected_pda = Pubkey::find_program_address(&[b"strategy", &[id]], program_id).0;

        // // 验证PDA是否匹配
        // require!(
        //     expected_pda == *account.key,
        //     PredictionMarketError::InvalidPDA
        // );

        // 将AccountInfo转为Account<StrategyState>
        // let mut strategy: Account<StrategyState> = Account::try_from(account)?;
        // // Deserialize the account
        // let mut strategy = Account::<StrategyState>::try_from(account)?;
        
        // Get mutable access to account data 
        // let mut data = account.try_borrow_mut_data()?;

        // let mut strategy = try_from_slice_unchecked::<StrategyState>(data.borrow()).unwrap();
        // let mut strategy = Account::<StrategyState>::try_from(account)?;

        // let _account_key = account.key();
        // let mut data = account.try_borrow_mut_data()?;
    
        // let mut strategy = StrategyState::try_deserialize(&mut data.as_ref())?;


        let mut strategy = Account::<StrategyState>::try_from(account)?;
        let mut data = account.try_borrow_mut_data()?;


        // 结算策略利息
        let interest = update_strategy_interest(
            strategy.total_principal,
            strategy.apr,
            strategy.last_update_ts,
            now
        );

        msg!("Strategy {} interest: {}", strategy.id, interest);

        strategy.total_interest = strategy.total_interest
            .checked_add(interest)
            .ok_or(PredictionMarketError::Overflow)?;
        strategy.last_update_ts = now;

        // 如果是当前策略
        if strategy.id == strategy_id {
            current_strategy_apr = strategy.apr;
            current_strategy_used_principal_percent = strategy.used_principal_percent;

            // 更新当前strategy的total_principal和total_user
            strategy.total_principal = strategy.total_principal
                .checked_add(amount)
                .ok_or(PredictionMarketError::Overflow)?;
            strategy.total_user = strategy.total_user
                .checked_add(1)
                .ok_or(PredictionMarketError::Overflow)?;
        }

        total_interest = total_interest
            .checked_add(interest)
            .ok_or(PredictionMarketError::Overflow)?;

        // strategy.exit(&program_id)?;
        strategy.last_update_ts = now;

        // let mut data = account.try_borrow_mut_data()?;

        // Serialize back to account data
        // strategy.try_serialize(&mut data.as_mut())?;
        // strategy.try_serialize(&mut &mut data[..])?;
        strategy.try_serialize(&mut data.as_mut())?;
    

    }

    

    // 处理用户receipt
    if receipt.user == Pubkey::default() {
        // 初始化新的receipt
        receipt.user = ctx.accounts.user.key();
        receipt.strategy_id = strategy_id;
        receipt.principal = amount;
        receipt.last_settle_ts = now;
        receipt.bump = ctx.bumps.receipt;
    } else {
        // 结算当前利息并更新receipt
        let time_diff = now
            .checked_sub(receipt.last_settle_ts)
            .ok_or(PredictionMarketError::InvalidTimeDiff)?;

        // 在更新principal之前计算利息
        let current_interest = calculate_interest(
            receipt.principal,
            time_diff,
            current_strategy_apr.into(),
        );

        msg!("Calculated interest for receipt: {}", current_interest);
        msg!("Previous receipt interest: {}", receipt.interest);
        msg!("Previous receipt principal: {}", receipt.principal);

        // 先更新利息
        receipt.interest = receipt
            .interest
            .checked_add(current_interest)
            .ok_or(PredictionMarketError::Overflow)?;

        // 再更新本金
        receipt.principal = receipt
            .principal
            .checked_add(amount)
            .ok_or(PredictionMarketError::Overflow)?;

        // 更新最后结算时间
        receipt.last_settle_ts = now;

        msg!("Updated receipt interest: {}", receipt.interest);
        msg!("Updated receipt principal: {}", receipt.principal);
    }

    // 可用本金: available_principal = amount * used_principal_percent / 100
    let available_principal = amount
        .checked_mul(current_strategy_used_principal_percent as u64)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_div(100)
        .ok_or(PredictionMarketError::Overflow)?;



    // 更新全局策略状态
    // 更新总本金: total_all_principal += amount
    vault.total_all_principal = vault
        .total_all_principal
        .checked_add(amount)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新总利息: total_all_interest += total_all_interest
    vault.total_all_interest = vault
        .total_all_interest
        .checked_add(total_interest)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新可用资金: available_funds += available_principal + total_all_interest
    vault.available_funds = vault
        .available_funds
        .checked_add(available_principal)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_add(total_interest)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新剩余资金: remaining_funds += available_principal + total_all_interest
    vault.remaining_funds = vault
        .remaining_funds
        .checked_add(available_principal)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_add(total_interest)
        .ok_or(PredictionMarketError::Overflow)?;
    vault.last_settle_ts = now;

    // 转账USDB
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.user_usdb.to_account_info(),
                to: ctx.accounts.vault_usdb_liquidity.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
        PREDICTION_TOKEN_DECIMALS,
    )?;

    // 记录存款事件
    emit!(DepositEvent {
        user: ctx.accounts.user.key(),
        amount,
        strategy_id,
        principal: receipt.principal,
        interest: receipt.interest,
        timestamp: now,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(strategy_id: u8)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Receipt::INIT_SPACE,
        seeds = [
            b"receipt", 
            &strategy_id.to_le_bytes()[..], 
            user.key().as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, Receipt>,

    #[account(
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, GlobalStrategyRegistry>,

    #[account(
        mut,
        associated_token::mint = usdb_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program, 
    )]
    pub user_usdb: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"liquidity"],
        bump
    )]
    pub vault_usdb_liquidity: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub strategy_id: u8,
    pub principal: u64,
    pub interest: u64,
    pub timestamp: i64,
}
