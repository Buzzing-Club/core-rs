use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::{GlobalStrategyRegistry, Market, Vault};

pub fn handler(ctx: Context<InitializeMarket>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let vault = &mut ctx.accounts.vault;

    // Initialize market
    market.admin = ctx.accounts.admin.key();
    market.next_id = 1; // 话题的下一个id
    market.bump = ctx.bumps.market;

    let now = Clock::get()?.unix_timestamp;

    // Initialize vault
    vault.admin = ctx.accounts.admin.key();
    vault.usdc_mint = ctx.accounts.usdc_mint.key();
    vault.usdb_mint = ctx.accounts.usdb_mint.key();
    vault.last_settle_ts = now;
    vault.fee = 300; // 初始手续费为3%
    vault.bump = ctx.bumps.vault;

    // 初始化策略注册表
    let global_strategy_registry = &mut ctx.accounts.global_strategy_registry;
    global_strategy_registry.admin = ctx.accounts.admin.key();
    global_strategy_registry.bump = ctx.bumps.global_strategy_registry;

    // 记录初始化事件
    emit!(MarketInitialized {
        admin: ctx.accounts.admin.key(),
        market: market.key(),
        vault: vault.key(),
        global_strategy_registry: global_strategy_registry.key(),
        usdc_swap: ctx.accounts.usdc_swap.key(),
        usdb_liquidity: ctx.accounts.usdb_liquidity.key(),
        usdb_fee: ctx.accounts.usdb_fee.key(),
        usdb_swap: ctx.accounts.usdb_swap.key(),
        timestamp: now,
    });

    Ok(())
}

pub fn update_global_strategy_registry(ctx: Context<UpdateGlobalStrategyRegistry>, strategy_ids: Vec<u8>) -> Result<()> {
    let registry = &mut ctx.accounts.global_strategy_registry;


    // 添加新的策略ID
    registry.strategy_ids = strategy_ids;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateGlobalStrategyRegistry<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"registry"],
        bump,
        has_one = admin
    )]
    pub global_strategy_registry: Account<'info, GlobalStrategyRegistry>,
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market"],
        bump
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        init,
        payer = admin,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = vault,
        seeds = [b"swap"],
        bump
    )]
    pub usdc_swap: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"liquidity"],
        bump
    )]
    pub usdb_liquidity: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"fee"],
        bump
    )]
    pub usdb_fee: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"usdb"],
        bump
    )]
    pub usdb_swap: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        space = 8 + GlobalStrategyRegistry::INIT_SPACE,
        seeds = [b"registry"],
        bump
    )]
    pub global_strategy_registry: Box<Account<'info, GlobalStrategyRegistry>>,

    pub usdc_mint: InterfaceAccount<'info, Mint>,
    pub usdb_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct MarketInitialized {
    pub admin: Pubkey,
    pub market: Pubkey,
    pub vault: Pubkey,
    pub global_strategy_registry: Pubkey,
    pub usdc_swap: Pubkey,
    pub usdb_liquidity: Pubkey,
    pub usdb_fee: Pubkey,
    pub usdb_swap: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct UsdbMintUpdated {
    pub vault: Pubkey,
    pub new_usdb_mint: Pubkey,
    pub timestamp: i64,
}
