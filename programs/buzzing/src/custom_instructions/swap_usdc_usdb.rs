use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::PREDICTION_TOKEN_DECIMALS;
use crate::errors::*;
use crate::state::Vault;

pub fn handler(ctx: Context<SwapUsdcUsdb>, amount: u64, is_usdc_to_usdb: bool) -> Result<()> {
    // 检查金额是否为0
    require!(
        amount > 0,
        PredictionMarketError::AmountMustBeGreaterThanZero
    );

    let vault = &ctx.accounts.vault;
    let vault_bump = vault.bump;

    // 预先计算PDA签名
    let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    let vault_signer:&[&[&[u8]] ] = &[&vault_seeds[..]];

    if is_usdc_to_usdb {
        // USDC -> USDB
        // 检查用户的USDC余额
        require!(
            ctx.accounts.user_usdc.amount >= amount,
            PredictionMarketError::InsufficientBalance
        );

        // 检查vault的USDB余额
        require!(
            ctx.accounts.vault_usdb.amount >= amount,
            PredictionMarketError::InsufficientLiquidity
        );

        // 转移USDC到vault的swap账户
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.user_usdc.to_account_info(),
                to: ctx.accounts.vault_usdc.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
            },
        );
        transfer_checked(cpi_ctx, amount, PREDICTION_TOKEN_DECIMALS)?;

        // 从vault转移USDB到用户
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.vault_usdb.to_account_info(),
                to: ctx.accounts.user_usdb.to_account_info(),
                authority: vault.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
            },
            vault_signer,
        );
        transfer_checked(cpi_ctx, amount, PREDICTION_TOKEN_DECIMALS)?;
    } else {
        // USDB -> USDC
        // 检查用户的USDB余额
        require!(
            ctx.accounts.user_usdb.amount >= amount,
            PredictionMarketError::InsufficientBalance
        );

        // 检查vault的USDC余额
        require!(
            ctx.accounts.vault_usdc.amount >= amount,
            PredictionMarketError::InsufficientSwapLiquidity
        );

        // 转移USDB到vault
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.user_usdb.to_account_info(),
                to: ctx.accounts.vault_usdb.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
            },
        );
        transfer_checked(cpi_ctx, amount, PREDICTION_TOKEN_DECIMALS)?;

        // 从vault转移USDC到用户
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.vault_usdc.to_account_info(),
                to: ctx.accounts.user_usdc.to_account_info(),
                authority: vault.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
            },
            vault_signer,
        );
        transfer_checked(cpi_ctx, amount, PREDICTION_TOKEN_DECIMALS)?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct SwapUsdcUsdb<'info> {
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
        token::mint = usdc_mint,
        token::authority = vault,
        token::token_program = token_program,
        seeds = [b"swap"],
        bump,
    )]
    pub vault_usdc: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        token::token_program = token_program,
        seeds = [b"usdb"],
        bump,
    )]
    pub vault_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdc_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_usdc: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdb_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = usdc_mint.key() == vault.usdc_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
