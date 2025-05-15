use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, burn, close_account, Mint, TokenAccount, TokenInterface};
use crate::errors::*;
use crate::state::{LiquidityPool, Topic};

pub fn handler(ctx: Context<ClosePools>, creatorx:Pubkey,topic_id:u64) -> Result<()> {
    require!(ctx.accounts.topic.topic_id == topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, creatorx, PredictionMarketError::CreatorMismatch);

    let clock = Clock::get()?;

    // 检查话题是否已结束
    require!(
        ctx.accounts.topic.is_ended,
        PredictionMarketError::TopicNotEnded
    );

    // 检查池子是否已关闭
    require!(
        !ctx.accounts.yes_pool.active && !ctx.accounts.no_pool.active,
        PredictionMarketError::PoolStillActive
    );

    let topic_key = ctx.accounts.topic.key();
    let yes_pool_bump = ctx.bumps.yes_pool;
    let yes_pool_seeds: &[&[u8]] = &[b"yes_pool", topic_key.as_ref(),&[yes_pool_bump]];
    let yes_pool_signer_seeds:&[&[&[u8]]] = &[&yes_pool_seeds[..]];

    let no_pool_bump = ctx.bumps.no_pool;
    let no_pool_seeds: &[&[u8]] = &[b"no_pool", topic_key.as_ref(),&[no_pool_bump]];
    let no_pool_signer_seeds:&[&[&[u8]]] = &[&no_pool_seeds[..]];

    // 销毁 yes 代币
    let yes_balance = ctx.accounts.yes_pool_token.amount;
    if yes_balance > 0 {
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::Burn {
                mint: ctx.accounts.yes_mint.to_account_info(),
                from: ctx.accounts.yes_pool_token.to_account_info(),
                authority: ctx.accounts.yes_pool.to_account_info(),
            },
            yes_pool_signer_seeds,
        );
        burn(cpi_ctx, yes_balance)?;
    }

    // 关闭 yes 代币账户
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_interface::CloseAccount {
            account: ctx.accounts.yes_pool_token.to_account_info(),
            destination: ctx.accounts.creator.to_account_info(),
            authority: ctx.accounts.yes_pool.to_account_info(),
        },
        yes_pool_signer_seeds,
    );
    close_account(cpi_ctx)?;

    // 销毁 no 代币
    let no_balance = ctx.accounts.no_pool_token.amount;
    if no_balance > 0 {
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::Burn {
                mint: ctx.accounts.no_mint.to_account_info(),
                from: ctx.accounts.no_pool_token.to_account_info(),
                authority: ctx.accounts.no_pool.to_account_info(),
            },
            no_pool_signer_seeds,
        );
        burn(cpi_ctx, no_balance)?;
    }

    // 关闭 no 代币账户
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_interface::CloseAccount {
            account: ctx.accounts.no_pool_token.to_account_info(),
            destination: ctx.accounts.creator.to_account_info(),
            authority: ctx.accounts.no_pool.to_account_info(),
        },
        no_pool_signer_seeds,
    );
    close_account(cpi_ctx)?;

    // 关闭 yes_pool_usdb 账户
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_interface::CloseAccount {
            account: ctx.accounts.yes_pool_usdb.to_account_info(),
            destination: ctx.accounts.creator.to_account_info(),
            authority: ctx.accounts.yes_pool.to_account_info(),
        },
        yes_pool_signer_seeds,
    );
    close_account(cpi_ctx)?;

    // 关闭 no_pool_usdb 账户
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_interface::CloseAccount {
            account: ctx.accounts.no_pool_usdb.to_account_info(),
            destination: ctx.accounts.creator.to_account_info(),
            authority: ctx.accounts.no_pool.to_account_info(),
        },
        no_pool_signer_seeds,
    );
    close_account(cpi_ctx)?;

    // 发出池子关闭事件
    emit!(PoolsClosedEvent {
        topic_id: ctx.accounts.topic.topic_id,
        creator: ctx.accounts.creator.key(),
        yes_pool: ctx.accounts.yes_pool.key(),
        no_pool: ctx.accounts.no_pool.key(),
        yes_mint: ctx.accounts.yes_mint.key(),
        no_mint: ctx.accounts.no_mint.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(creatorx:Pubkey,topic_id: u64)]
pub struct ClosePools<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        has_one = creator,
        constraint = topic.is_ended @ PredictionMarketError::TopicNotEnded,
        seeds = [
            b"topic",
            &topic_id.to_le_bytes(),
            creatorx.key().as_ref()
        ],
        bump = topic.bump
    )]
    pub topic: Box<Account<'info, Topic>>,

    #[account(
        mut,
        close = creator,
        constraint = !yes_pool.active @ PredictionMarketError::PoolStillActive,
        seeds = [b"yes_pool", topic.key().as_ref()],
        bump,
    )]
    pub yes_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        mut,
        close = creator,
        constraint = !no_pool.active @ PredictionMarketError::PoolStillActive,
        seeds = [b"no_pool", topic.key().as_ref()],
        bump,
    )]
    pub no_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        mut,
        seeds = [b"yes_mint", topic.key().as_ref()],
        bump,
    )]
    pub yes_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [b"no_mint", topic.key().as_ref()],
        bump,
    )]
    pub no_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        token::mint = yes_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_token", topic.key().as_ref()],
        bump,
    )]
    pub yes_pool_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = no_mint,
        token::authority = no_pool,
        token::token_program = token_program,
        seeds = [b"no_pool_token", topic.key().as_ref()],
        bump,
    )]
    pub no_pool_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_usdb", topic.key().as_ref()],
        bump,
    )]
    pub yes_pool_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = no_pool,
        token::token_program = token_program,
        seeds = [b"no_pool_usdb", topic.key().as_ref()],
        bump,
    )]
    pub no_pool_usdb: Box<InterfaceAccount<'info, TokenAccount>>,

    pub usdb_mint: Box<InterfaceAccount<'info, Mint>>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct PoolsClosedEvent {
    pub topic_id: u64,
    pub creator: Pubkey,
    pub yes_pool: Pubkey,
    pub no_pool: Pubkey,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub timestamp: i64,
}
