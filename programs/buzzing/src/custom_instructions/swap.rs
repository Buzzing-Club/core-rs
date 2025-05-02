use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};

use crate::constants::{PREDICTION_TOKEN_DECIMALS, SLIPPAGE_TOLERANCE};
use crate::errors::*;
use crate::state::{LiquidityPool, Topic, Vault};
use crate::utils::calculate_swap_output;

pub fn yes_swap(ctx: Context<YesSwap>,creator: Pubkey, topic_id: u64, amount_in: u64, is_yes_to_usdb: bool) -> Result<()> {
    // 验证topic.topic_id是否与传入的topic_id一致
    require!(ctx.accounts.topic.topic_id == topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, creator, PredictionMarketError::CreatorMismatch);
    
    // 根据交易方向设置输入和输出账户
    let (reserve_in, reserve_out) = if is_yes_to_usdb {
        (
            ctx.accounts.pool_yes_account.amount,
            ctx.accounts.pool_usdb_account.amount,
        )
    } else {
        (
            ctx.accounts.pool_usdb_account.amount,
            ctx.accounts.pool_yes_account.amount,
        )
    };

    // let vault = &ctx.accounts.vault;
    let yes_pool = &ctx.accounts.yes_pool;

    // 计算输出金额和手续费（包含错误检查）
    let (amount_out, fee_amount) = calculate_swap_output(
        amount_in,
        reserve_in,
        reserve_out,
        ctx.accounts.vault.fee,
        SLIPPAGE_TOLERANCE,
        is_yes_to_usdb,
    )?;

    // let vault_bump = vault.bump;
    // let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    // let signer_seeds:&[&[&[u8]]] = &[&vault_seeds[..]];

    let topic = ctx.accounts.topic.key();
    let yes_pool_bump = ctx.bumps.yes_pool;
    let yes_pool_seeds: &[&[u8]] = &[
        b"yes_pool", 
        topic.as_ref(),
        &[yes_pool_bump]
        ];
    let yes_pool_signer_seeds:&[&[&[u8]]] = &[&yes_pool_seeds[..]];

    if is_yes_to_usdb {
        // YES -> USDB
        // 1. 先转入YES代币
        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.user_yes_account.to_account_info(),
                    to: ctx.accounts.pool_yes_account.to_account_info(),
                    mint: ctx.accounts.yes_token_mint.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_in,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 2. 转出USDB（扣除手续费）
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.user_usdb_account.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: yes_pool.to_account_info(),
                },
                yes_pool_signer_seeds,
            ),
            amount_out.checked_sub(fee_amount).unwrap(),
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 3. 转移USDB手续费
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.usdb_fee.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: yes_pool.to_account_info(),
                },
                yes_pool_signer_seeds,
            ),
            fee_amount,
            PREDICTION_TOKEN_DECIMALS,
        )?;
    } else {
        // USDB -> YES
        // 1. 转入USDB
        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.user_usdb_account.to_account_info(),
                    to: ctx.accounts.pool_usdb_account.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_in,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 2. 转移USDB手续费
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.usdb_fee.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: yes_pool.to_account_info(),
                },
                yes_pool_signer_seeds,
            ),
            fee_amount,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 3. 转出YES代币
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_yes_account.to_account_info(),
                    to: ctx.accounts.user_yes_account.to_account_info(),
                    mint: ctx.accounts.yes_token_mint.to_account_info(),
                    authority: yes_pool.to_account_info(),
                },
                yes_pool_signer_seeds,
            ),
            amount_out,
            PREDICTION_TOKEN_DECIMALS,
        )?;
    }

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        topic: ctx.accounts.topic.key(),
        amount_in,
        amount_out,
        is_yes_pool: true,
        is_token_to_usdb: is_yes_to_usdb,
    });

    Ok(())
}

pub fn no_swap(ctx: Context<NoSwap>, creator: Pubkey, topic_id: u64, amount_in: u64, is_no_to_usdb: bool) -> Result<()> {
    // 验证topic.topic_id是否与传入的topic_id一致
    require!(ctx.accounts.topic.topic_id == topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, creator, PredictionMarketError::CreatorMismatch);

    // 根据交易方向设置输入和输出账户
    let (reserve_in, reserve_out) = if is_no_to_usdb {
        (
            ctx.accounts.pool_no_account.amount,
            ctx.accounts.pool_usdb_account.amount,
        )
    } else {
        (
            ctx.accounts.pool_usdb_account.amount,
            ctx.accounts.pool_no_account.amount,
        )
    };

    // let vault = &ctx.accounts.vault;
    let no_pool = &ctx.accounts.no_pool;

    // 计算输出金额和手续费（包含错误检查）
    let (amount_out, fee_amount) = calculate_swap_output(
        amount_in,
        reserve_in,
        reserve_out,
        ctx.accounts.vault.fee,
        SLIPPAGE_TOLERANCE,
        is_no_to_usdb,
    )?;

    // let vault_bump = vault.bump;
    // let vault_seeds: &[&[u8]] = &[b"vault", &[vault_bump]];
    // let signer_seeds:&[&[&[u8]] ] = &[&vault_seeds[..]];

    let topic = ctx.accounts.topic.key();
    let no_pool_bump = ctx.bumps.no_pool;
    let no_pool_seeds: &[&[u8]] = &[
        b"no_pool", 
        topic.as_ref(),
        &[no_pool_bump]
        ];
    let no_pool_signer_seeds:&[&[&[u8]]] = &[&no_pool_seeds[..]];

    if is_no_to_usdb {
        // NO -> USDB
        // 1. 先转入NO代币
        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.user_no_account.to_account_info(),
                    to: ctx.accounts.pool_no_account.to_account_info(),
                    mint: ctx.accounts.no_token_mint.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_in,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 2. 转出USDB（扣除手续费）
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.user_usdb_account.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: no_pool.to_account_info(),
                },
                no_pool_signer_seeds,
            ),
            amount_out.checked_sub(fee_amount).unwrap(),
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 3. 转移USDB手续费
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.usdb_fee.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: no_pool.to_account_info(),
                },
                no_pool_signer_seeds,
            ),
            fee_amount,
            PREDICTION_TOKEN_DECIMALS,
        )?;
    } else {
        // USDB -> NO
        // 1. 转入USDB
        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.user_usdb_account.to_account_info(),
                    to: ctx.accounts.pool_usdb_account.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_in,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 2. 转移USDB手续费
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_usdb_account.to_account_info(),
                    to: ctx.accounts.usdb_fee.to_account_info(),
                    mint: ctx.accounts.usdb_mint.to_account_info(),
                    authority: no_pool.to_account_info(),
                },
                no_pool_signer_seeds,
            ),
            fee_amount,
            PREDICTION_TOKEN_DECIMALS,
        )?;

        // 3. 转出NO代币
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::TransferChecked {
                    from: ctx.accounts.pool_no_account.to_account_info(),
                    to: ctx.accounts.user_no_account.to_account_info(),
                    mint: ctx.accounts.no_token_mint.to_account_info(),
                    authority: no_pool.to_account_info(),
                },
                no_pool_signer_seeds,
            ),
            amount_out,
            PREDICTION_TOKEN_DECIMALS,
        )?;
    }

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        topic: ctx.accounts.topic.key(),
        amount_in,
        amount_out,
        is_yes_pool: false,
        is_token_to_usdb: is_no_to_usdb,
    });

    Ok(())
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, topic_id: u64)]
pub struct YesSwap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = topic.is_ended == false @ PredictionMarketError::TopicEnded,
        seeds = [
            b"topic", 
            &topic_id.to_le_bytes(),
            creator.key().as_ref()
        ],
        bump = topic.bump
    )]
    pub topic: Box<Account<'info, Topic>>,

    #[account(
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        mut,
        constraint = yes_pool.active == true @ PredictionMarketError::PoolStillActive,
        seeds = [b"yes_pool", topic.key().as_ref()],
        bump,
    )]
    pub yes_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = yes_token_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_yes_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,   
        token::mint = yes_token_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_token", topic.key().as_ref()],
        bump,
    )]
    pub pool_yes_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdb_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_usdb_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = yes_pool,
        token::token_program = token_program,
        seeds = [b"yes_pool_usdb", topic.key().as_ref()],
        bump,
    )]
    pub pool_usdb_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        token::token_program = token_program,
        seeds = [b"fee"],
        bump
    )]
    pub usdb_fee: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        mint::token_program = token_program,
        seeds = [b"yes_mint", topic.key().as_ref()],
        bump,
    )]
    pub yes_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(creator: Pubkey, topic_id: u64)]
pub struct NoSwap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = topic.is_ended == false @ PredictionMarketError::TopicEnded,
        seeds = [
            b"topic",
            &topic_id.to_le_bytes(), 
            creator.key().as_ref()
        ],
        bump = topic.bump
    )]
    pub topic: Box<Account<'info, Topic>>,

    #[account(
        seeds = [b"vault"],
        bump = vault.bump,
    )]
    pub vault: Box<Account<'info, Vault>>,

    #[account(
        mut,
        constraint = no_pool.active == true @ PredictionMarketError::PoolStillActive,
        seeds = [b"no_pool", topic.key().as_ref()],
        bump,
    )]
    pub no_pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = no_token_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_no_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = no_token_mint,
        token::authority = no_pool,
        seeds = [b"no_pool_token", topic.key().as_ref()],
        bump,
    )]
    pub pool_no_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = usdb_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_usdb_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = no_pool,
        seeds = [b"no_pool_usdb", topic.key().as_ref()],
        bump,
    )]
    pub pool_usdb_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = usdb_mint,
        token::authority = vault,
        seeds = [b"fee"],
        bump
    )]
    pub usdb_fee: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        mint::token_program = token_program,
        seeds = [b"no_mint", topic.key().as_ref()],
        bump,
    )]
    pub no_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        constraint = usdb_mint.key() == vault.usdb_mint @ PredictionMarketError::InvalidTokenMint
    )]
    pub usdb_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub topic: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub is_yes_pool: bool,
    pub is_token_to_usdb: bool,
}
