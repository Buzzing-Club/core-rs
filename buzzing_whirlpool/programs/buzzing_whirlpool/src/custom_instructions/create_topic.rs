use anchor_lang::prelude::*;
// use anchor_spl::token_interface;
use anchor_spl::token_interface::{self, mint_to, Mint, MintTo, TokenAccount, TokenInterface};

use crate::constants::{
    INITIAL_LIQUIDITY, INITIAL_PRICE, PREDICTION_TOKEN_DECIMALS};
use crate::errors::*;
use crate::state::{LiquidityPool, Market, Topic, Vault};

use crate::utils::{
    get_liquidity_from_token_b,
    get_token_a_from_liquidity,
};

pub fn handler(ctx: Context<CreateTopic>, topic_ipfs_hash: [u8; 32]) -> Result<()> {
    let topic = &mut ctx.accounts.topic;
    let yes_pool = &mut ctx.accounts.yes_pool;
    let no_pool = &mut ctx.accounts.no_pool;
    let market = &mut ctx.accounts.market;
    let vault = &mut ctx.accounts.vault;

    // 注入的USDB数量 (例如 100 USDB, 假设6位小数)
    let usdb_amount_injected = INITIAL_LIQUIDITY;

    // 定义 Q64.64 格式的平方根价格常量
    // 价格范围下限: 0.0001 USDC
    // sqrt(0.0001) * 2^64 = 184467440737095516
    const SQRT_Q64_PRICE_RANGE_LOWER: u128 = 184467440737095516;

    // 当前价格: 0.5 USDC
    // sqrt(0.5) * 2^64 = 13043817825332782212
    const SQRT_Q64_CURRENT_PRICE: u128 = 13043817825332782212;

    // 价格范围上限: 1.0 USDC
    // sqrt(1.0) * 2^64 = 18446744073709551615
    const SQRT_Q64_PRICE_RANGE_UPPER: u128 = 18446744073709551615;


    // 1. 计算流动性 L
    // L 由注入的 USDB 在 [当前价格, 范围上限] 区间确定
    let liquidity = get_liquidity_from_token_b(
        usdb_amount_injected,
        SQRT_Q64_CURRENT_PRICE,       // 此计算段的下限 (当前价格)
        SQRT_Q64_PRICE_RANGE_UPPER,   // 此计算段的上限 (范围上限)
        true
    );

    // 2. 计算需要注入的 A 代币数量
    // A 代币数量由相同的 L 在 [范围下限, 当前价格] 区间确定
    let token_a_amount_to_inject = get_token_a_from_liquidity(
        liquidity,
        SQRT_Q64_PRICE_RANGE_LOWER,  // 此计算段的下限 (范围下限)
        SQRT_Q64_CURRENT_PRICE,      // 此计算段的上限 (当前价格)
        true
    );

    // 将 usdb_amount_injected 变量名统一，以便后续使用
    let usdb_reserve_for_pool = usdb_amount_injected;
    // 将 token_a_amount_to_inject 变量名统一，以便后续使用
    let token_reserve_for_pool = token_a_amount_to_inject as u64;

    let vault_bump = vault.bump;
    let topic_bump = ctx.bumps.topic;
    let yes_mint_bump = ctx.bumps.yes_mint;
    let no_mint_bump = ctx.bumps.no_mint;
    let need_usdb = usdb_reserve_for_pool * 2 + token_reserve_for_pool;

    // 检查vault的remaining_funds账户是否有足够的余额
    require!(
        vault.remaining_funds >= need_usdb,
        PredictionMarketError::InsufficientLiquidity
    );

    // 预先计算PDA签名
    let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    let vault_signer:&[&[&[u8]]] = &[&vault_seeds[..]];

    // 初始化topic
    topic.topic_id = market.next_id;
    topic.creator = ctx.accounts.creator.key();
    topic.topic_ipfs_hash = topic_ipfs_hash;
    topic.yes_mint = ctx.accounts.yes_mint.key();
    topic.no_mint = ctx.accounts.no_mint.key();
    topic.yes_pool = yes_pool.key();
    topic.no_pool = no_pool.key();
    topic.toltal_token = token_reserve_for_pool;
    topic.is_ended = false;
    topic.winning_token = None;
    topic.bump = topic_bump;

    // 初始化yes pool
    yes_pool.usdb_mint = vault.usdb_mint.key();
    yes_pool.token_mint = ctx.accounts.yes_mint.key();
    yes_pool.usdb_reserve = ctx.accounts.yes_pool_usdb.key();
    yes_pool.token_reserve = ctx.accounts.yes_pool_token.key();
    yes_pool.tick_spacing = 1; // Each tick represents 0.01% price change
    yes_pool.sqrt_price = SQRT_Q64_CURRENT_PRICE; // 设置为当前价格的Q64.64平方根
    yes_pool.tick_current_index = -6931; // log(0.5) / log(1.0001) - 这个需要根据实际的 P_current 和 tick_spacing 重新精确计算
    yes_pool.current_price = INITIAL_PRICE; // 0.5 USDB (与 SQRT_Q64_CURRENT_PRICE 对应)
    yes_pool.liquidity = liquidity; // 设置计算出的流动性 L
    yes_pool.fee_rate = 3000; // 默认 0.3% 交易费率 (3000 / 1,000,000)
    yes_pool.active = true;

    // 初始化no pool
    no_pool.usdb_mint = vault.usdb_mint.key();
    no_pool.token_mint = ctx.accounts.no_mint.key();
    no_pool.usdb_reserve = ctx.accounts.no_pool_usdb.key();
    no_pool.token_reserve = ctx.accounts.no_pool_token.key();
    no_pool.tick_spacing = 1; // Each tick represents 0.01% price change
    no_pool.sqrt_price = SQRT_Q64_CURRENT_PRICE; // 设置为当前价格的Q64.64平方根
    no_pool.tick_current_index = -6931; // log(0.5) / log(1.0001) - 这个需要根据实际的 P_current 和 tick_spacing 重新精确计算
    no_pool.current_price = INITIAL_PRICE; // 0.5 USDB
    no_pool.liquidity = liquidity; // 设置计算出的流动性 L
    no_pool.fee_rate = 3000; // 默认 0.3% 交易费率 (3000 / 1,000_000)
    no_pool.active = true;
    // 更新vault状态
    vault.remaining_funds = vault.remaining_funds.checked_sub(need_usdb).unwrap();
    vault.guarantee_funds = vault
        .guarantee_funds
        .checked_add(token_reserve_for_pool) // 更新为计算出的A代币数量
        .unwrap();

    // 更新market
    market.next_id += 1;

    // 批量转账USDB
    let token_program = ctx.accounts.token_program.to_account_info();
    let usdb_mint = ctx.accounts.usdb_mint.to_account_info();
    let vault_account = vault.to_account_info();
    let vault_usdb = ctx.accounts.vault_usdb.to_account_info();

    // 转账到yes_pool_usdb
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.clone(),
        token_interface::TransferChecked {
            from: vault_usdb.clone(),
            to: ctx.accounts.yes_pool_usdb.to_account_info(),
            mint: usdb_mint.clone(),
            authority: vault_account.clone(),
        },
        vault_signer,
    );
    token_interface::transfer_checked(cpi_ctx, usdb_reserve_for_pool, PREDICTION_TOKEN_DECIMALS)?; // 使用注入的USDB数量

    // 转账到no_pool_usdb
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.clone(),
        token_interface::TransferChecked {
            from: vault_usdb,
            to: ctx.accounts.no_pool_usdb.to_account_info(),
            mint: usdb_mint,
            authority: vault_account,
        },
        vault_signer,
    );
    token_interface::transfer_checked(cpi_ctx, usdb_reserve_for_pool, PREDICTION_TOKEN_DECIMALS)?; // 使用注入的USDB数量

    // 批量铸造token
    let topic_key = topic.key();
    // let topic_account = topic.to_account_info();

    // 铸造yes token
    let yes_seeds:&[&[u8]] = &[b"yes_mint", topic_key.as_ref(), &[yes_mint_bump]];
    let yes_signer:&[&[&[u8]]] = &[&yes_seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.clone(),
        MintTo {
            mint: ctx.accounts.yes_mint.to_account_info(),
            to: ctx.accounts.yes_pool_token.to_account_info(),
            authority: ctx.accounts.yes_mint.to_account_info(),
        },
        yes_signer,
    );

    // 调用 mint_to_checked CPI
    mint_to(cpi_ctx, token_reserve_for_pool)?; // 使用计算出的A代币数量
    // 铸造no token
    let no_seeds:&[&[u8]]  = &[b"no_mint", topic_key.as_ref(), &[no_mint_bump]];
    let no_signer:&[&[&[u8]] ] = &[&no_seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        token_program,
        MintTo {
            mint: ctx.accounts.no_mint.to_account_info(),
            to: ctx.accounts.no_pool_token.to_account_info(),
            authority: ctx.accounts.no_mint.to_account_info(),
        },
        no_signer,
    );
    mint_to(cpi_ctx, token_reserve_for_pool)?; // 使用计算出的A代币数量

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTopic<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market"],
        bump = market.bump,
    )]
    pub market: Box<Account<'info, Market>>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"liquidity"],
        bump,
    )]
    pub vault_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = creator,
        space = 8 + Topic::INIT_SPACE,
        seeds = [
            b"topic", 
            &market.next_id.to_le_bytes()[..],
            creator.key().as_ref()
        ],
        bump
    )]
    pub topic: Box<Account<'info, Topic>>,

    #[account(
        init,
        payer = creator,
        mint::authority = yes_mint,
        mint::decimals = PREDICTION_TOKEN_DECIMALS,
        mint::token_program = token_program,
        seeds = [b"yes_mint", topic.key().as_ref()],
        bump,
    )]
    pub yes_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = creator,
        mint::authority = no_mint,
        mint::decimals = PREDICTION_TOKEN_DECIMALS,
        mint::token_program = token_program,
        seeds = [b"no_mint", topic.key().as_ref()],
        bump,
    )]
    pub no_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = creator,
        space = 8 + LiquidityPool::INIT_SPACE,
        seeds = [b"yes_pool", topic.key().as_ref()],
        bump
    )]
    pub yes_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        init,
        payer = creator,
        space = 8 + LiquidityPool::INIT_SPACE,
        seeds = [b"no_pool", topic.key().as_ref()],
        bump
    )]
    pub no_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        init,
        payer = creator,
        token::mint = usdb_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_usdb", topic.key().as_ref()],
        bump
    )]
    pub yes_pool_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = creator,
        token::mint = yes_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_token", topic.key().as_ref()],
        bump
    )]
    pub yes_pool_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = creator,
        token::mint = usdb_mint,
        token::authority = no_pool,
        token::token_program = token_program,
        seeds = [b"no_pool_usdb", topic.key().as_ref()],
        bump
    )]
    pub no_pool_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = creator,
        token::mint = no_mint,
        token::authority = no_pool,
        token::token_program = token_program,
        seeds = [b"no_pool_token", topic.key().as_ref()],
        bump
    )]
    pub no_pool_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
