use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::PREDICTION_TOKEN_DECIMALS;
use crate::errors::*;
use crate::state::{Topic, Vault};

/// 处理代币赎回
fn handle_token_redeem<'info>(
    token: &InterfaceAccount<'info, TokenAccount>,
    is_winning: bool,
    user: &Signer<'info>,
    vault: &mut Account<'info, Vault>,
    vault_usdb_liquidity: &InterfaceAccount<'info, TokenAccount>,
    user_usdb: &InterfaceAccount<'info, TokenAccount>,
    usdb_mint: &InterfaceAccount<'info, Mint>,
    token_mint: &InterfaceAccount<'info, Mint>,
    token_program: &Interface<'info, TokenInterface>,
    vault_signer: &[&[&[u8]]],
) -> Result<()> {
    let token_amount = token.amount;
    if token_amount == 0 {
        return Ok(());
    }

    // 如果是获胜的代币，转移USDB奖励
    if is_winning {
        // 检查vault是否有足够的USDB
        require!(
            vault_usdb_liquidity.amount >= token_amount,
            PredictionMarketError::InsufficientLiquidity
        );

        // 从vault的usdb_liquidity账户转移USDB到用户账户
        transfer_checked(
            CpiContext::new_with_signer(
                token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: vault_usdb_liquidity.to_account_info(),
                    to: user_usdb.to_account_info(),
                    mint: usdb_mint.to_account_info(),
                    authority: vault.to_account_info(),
                },
                vault_signer,
            ),
            token_amount,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 更新 GlobalStrategyState 的 guarantee_funds
        vault.guarantee_funds = vault
            .guarantee_funds
            .checked_sub(token_amount)
            .ok_or(PredictionMarketError::Overflow)?;
    }

    // 销毁用户的代币
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        token_interface::Burn {
            mint: token_mint.to_account_info(),
            from: token.to_account_info(),
            authority: user.to_account_info(),
        },
    );
    token_interface::burn(cpi_ctx, token_amount)?;

    // 关闭用户的代币账户
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        token_interface::CloseAccount {
            account: token.to_account_info(),
            destination: user.to_account_info(),
            authority: user.to_account_info(),
        },
    );
    token_interface::close_account(cpi_ctx)?;

    Ok(())
}

pub fn handler(ctx: Context<Redeem>,creator: Pubkey, topic_id: u64) -> Result<()> {
    require!(ctx.accounts.topic.topic_id == topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, creator, PredictionMarketError::CreatorMismatch);
    // 获取时钟
    let clock = Clock::get()?;

    // 获取vault的bump
    let vault_bump = ctx.accounts.vault.bump;
    let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    let vault_signer:&[&[&[u8]] ] = &[&vault_seeds[..]];

    // 确定获胜的代币
    let winning_token = ctx.accounts.topic.winning_token.unwrap();
    let is_yes_winning = winning_token == ctx.accounts.topic.yes_mint;

    // 处理 yes token
    if let Some(yes_token) = &ctx.accounts.yes_token {
        handle_token_redeem(
            yes_token,
            is_yes_winning,
            &ctx.accounts.user,
            &mut ctx.accounts.vault,
            &ctx.accounts.vault_usdb_liquidity,
            &ctx.accounts.user_usdb,
            &ctx.accounts.usdb_mint,
            &ctx.accounts.yes_mint,
            &ctx.accounts.token_program,
            vault_signer,
        )?;

        // 记录事件
        emit!(RedeemEvent {
            user: ctx.accounts.user.key(),
            topic: ctx.accounts.topic.key(),
            token_mint: ctx.accounts.topic.yes_mint,
            token_amount: yes_token.amount,
            is_winning_token: is_yes_winning,
            usdb_amount: if is_yes_winning { yes_token.amount } else { 0 },
            timestamp: clock.unix_timestamp,
        });
    }

    // 处理 no token
    if let Some(no_token) = &ctx.accounts.no_token {
        handle_token_redeem(
            no_token,
            !is_yes_winning,
            &ctx.accounts.user,
            &mut ctx.accounts.vault,
            &ctx.accounts.vault_usdb_liquidity,
            &ctx.accounts.user_usdb,
            &ctx.accounts.usdb_mint,
            &ctx.accounts.no_mint,
            &ctx.accounts.token_program,
            vault_signer,
        )?;

        // 记录事件
        emit!(RedeemEvent {
            user: ctx.accounts.user.key(),
            topic: ctx.accounts.topic.key(),
            token_mint: ctx.accounts.no_mint.key(),
            token_amount: no_token.amount,
            is_winning_token: !is_yes_winning,
            usdb_amount: if !is_yes_winning { no_token.amount } else { 0 },
            timestamp: clock.unix_timestamp,
        });
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, topic_id: u64)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        mut,
        constraint = topic.is_ended == true @ PredictionMarketError::TopicEnded,
        seeds = [
            b"topic", 
            &topic_id.to_le_bytes(),
            creator.as_ref()
        ],
        bump = topic.bump
    )]
    pub topic: Box<Account<'info, Topic>>,

    #[account(
        mut,
        associated_token::mint = usdb_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        token::token_program = token_program,
        seeds = [b"liquidity"],
        bump
    )]
    pub vault_usdb_liquidity: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = yes_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub yes_token: Option<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = no_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub no_token: Option<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        mint::token_program = token_program,
        seeds = [b"yes_mint", topic.key().as_ref()],
        bump,
    )]
    pub yes_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        mint::token_program = token_program,
        seeds = [b"no_mint", topic.key().as_ref()],
        bump,
    )]
    pub no_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[event]
pub struct RedeemEvent {
    pub user: Pubkey,
    pub topic: Pubkey,
    pub token_mint: Pubkey,
    pub token_amount: u64,
    pub is_winning_token: bool,
    pub usdb_amount: u64,
    pub timestamp: i64,
}
