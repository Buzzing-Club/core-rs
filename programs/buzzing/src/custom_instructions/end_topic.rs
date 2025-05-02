use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::PREDICTION_TOKEN_DECIMALS;
use crate::errors::*;
use crate::state::{LiquidityPool, Oracle, Topic, Vault};

pub fn handler(ctx: Context<EndTopic>, creator: Pubkey, topic_id: u64, winning_token: Pubkey) -> Result<()> {
    require!(ctx.accounts.topic.topic_id == topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, creator, PredictionMarketError::CreatorMismatch);

    // 基础检查
    require!(
        !ctx.accounts.topic.is_ended,
        PredictionMarketError::TopicEnded
    );
    require!(
        winning_token == ctx.accounts.topic.yes_mint || winning_token == ctx.accounts.topic.no_mint,
        PredictionMarketError::InvalidWinningToken
    );

    // 检查调用者是否是Oracle管理员
    require!(
        ctx.accounts.oracle_admin.key() == ctx.accounts.oracle.admin,
        PredictionMarketError::UnauthorizedOracle
    );

    
    // let vault_bump = vault.bump;
    // let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    // let vault_signer:&[&[&[u8]] ] = &[&vault_seeds[..]];
   
    // 设置话题已结束并记录获胜代币
    let topic = &mut ctx.accounts.topic;
    topic.is_ended = true;
    topic.winning_token = Some(winning_token);

    let yes_pool = &mut ctx.accounts.yes_pool;
    let no_pool = &mut ctx.accounts.no_pool;

    let topic_key = topic.key();
    let yes_pool_bump = ctx.bumps.yes_pool;
    let yes_pool_seeds: &[&[u8]] = &[b"yes_pool", topic_key.as_ref(),&[yes_pool_bump]];
    let yes_pool_signer_seeds:&[&[&[u8]]] = &[&yes_pool_seeds[..]];

    let no_pool_bump = ctx.bumps.no_pool;
    let no_pool_seeds: &[&[u8]] = &[b"no_pool", topic_key.as_ref(),&[no_pool_bump]];
    let no_pool_signer_seeds:&[&[&[u8]]] = &[&no_pool_seeds[..]];


    // 从yes池子转移USDB到vault
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.yes_pool_usdb.to_account_info(),
                to: ctx.accounts.vault_usdb.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
                authority: yes_pool.to_account_info(),
            },
            yes_pool_signer_seeds,
        ),
        ctx.accounts.yes_pool_usdb.amount,
        PREDICTION_TOKEN_DECIMALS,
    )?;

    // 从no池子转移USDB到vault
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ctx.accounts.no_pool_usdb.to_account_info(),
                to: ctx.accounts.vault_usdb.to_account_info(),
                mint: ctx.accounts.usdb_mint.to_account_info(),
                authority: no_pool.to_account_info(),
            },
            no_pool_signer_seeds,
        ),
        ctx.accounts.no_pool_usdb.amount,
        PREDICTION_TOKEN_DECIMALS,
    )?;


    // 获取vault
    let vault = &mut ctx.accounts.vault;

    //vault.remaining_funds += losing_pool_usdb_amount + winning_pool_usdb_amount
    vault.remaining_funds = vault
        .remaining_funds
        .checked_add(ctx.accounts.yes_pool_usdb.amount)
        .ok_or(PredictionMarketError::Overflow)?
        .checked_add(ctx.accounts.no_pool_usdb.amount)
        .ok_or(PredictionMarketError::Overflow)?;

    // 更新池子状态
    
    // 设置两个池子都为不活跃
    yes_pool.active = false;
    no_pool.active = false;

    // 清空失败池子的储备并更新保证金
    if winning_token == topic.yes_mint {
        no_pool.current_price = 0;

        let rest_yes = topic
            .toltal_token
            .checked_sub(ctx.accounts.yes_pool_token.amount)
            .ok_or(PredictionMarketError::Overflow)?;

        vault.guarantee_funds = vault
            .guarantee_funds
            .checked_add(ctx.accounts.yes_pool_token.amount)
            .ok_or(PredictionMarketError::Overflow)?
            .checked_sub(topic.toltal_token)
            .ok_or(PredictionMarketError::Overflow)?;

        // 由于抵押是1:1，剩余的赢的token就退回remaining_funds中
        vault.remaining_funds = vault
            .remaining_funds
            .checked_add(rest_yes)
            .ok_or(PredictionMarketError::Overflow)?
    } else {
        yes_pool.current_price = 0;

        let rest_no = topic
            .toltal_token
            .checked_sub(ctx.accounts.no_pool_token.amount)
            .ok_or(PredictionMarketError::Overflow)?;

        vault.guarantee_funds = vault
            .guarantee_funds
            .checked_add(ctx.accounts.no_pool_token.amount)
            .ok_or(PredictionMarketError::Overflow)?
            .checked_sub(topic.toltal_token)
            .ok_or(PredictionMarketError::Overflow)?;

        vault.remaining_funds = vault
            .remaining_funds
            .checked_add(rest_no)
            .ok_or(PredictionMarketError::Overflow)?
    }

    // 发出话题结束事件
    emit!(TopicEndedEvent {
        topic: topic.key(),
        oracle: ctx.accounts.oracle.key(),
        oracle_admin: ctx.accounts.oracle_admin.key(),
        winning_token,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, topic_id: u64)]
pub struct EndTopic<'info> {
    #[account(mut)]
    pub oracle_admin: Signer<'info>,

    #[account(
        seeds = [b"oracle"],
        bump = oracle.bump,
        constraint = oracle_admin.key() == oracle.admin @ PredictionMarketError::UnauthorizedOracle
    )]
    pub oracle: Box<Account<'info, Oracle>>,

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
        mut,
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
        constraint = no_pool.active == true @ PredictionMarketError::PoolStillActive,
        seeds = [b"yes_pool", topic.key().as_ref()],
        bump
    )]
    pub yes_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        mut,
        constraint = no_pool.active == true @ PredictionMarketError::PoolStillActive,
        seeds = [b"no_pool", topic.key().as_ref()],
        bump
    )]
    pub no_pool: Box<Account<'info, LiquidityPool>>,

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

    #[account(
        token::mint = topic.yes_mint,
        token::authority = yes_pool,
        seeds = [b"yes_pool_token", topic.key().as_ref()],
        bump
    )]
    pub yes_pool_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        token::mint = topic.no_mint,
        token::authority = no_pool,
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

// 话题结束事件
#[event]
pub struct TopicEndedEvent {
    pub topic: Pubkey,
    pub oracle: Pubkey,
    pub oracle_admin: Pubkey,
    pub winning_token: Pubkey,
    // pub losing_pool_usdb_amount: u64,
    // pub winning_pool_usdb_amount: u64,
    pub timestamp: i64,
}
