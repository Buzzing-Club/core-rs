use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, transfer_checked, Mint, TokenAccount, TokenInterface};
use crate::math::swap_math;
// Assuming swap_math.rs is in src/ (crate::swap_math)
// It relies on crate::math for core calculations.
// And crate::tick_math for tick conversions (for TODOs).
// Example:
// use crate::math; // Ensure this module exists and is a dependency for swap_math
// use crate::tick_math; // Ensure this module exists for tick index and price conversions

use crate::constants::{PREDICTION_TOKEN_DECIMALS}; // FEE_RATE_MUL_VALUE is likely in math.rs or swap_math.rs
use crate::errors::*;
use crate::state::{LiquidityPool, Topic, Vault};
// Old import: use crate::utils::calculate_swap_output;

// Use actual tick_math functions from the specified path
// Assuming programs/buzzing/src/math/tick_math.rs exists and defines the necessary functions
use crate::math::tick_math::tick_index_from_sqrt_price;

pub fn yes_swap(
    ctx: Context<YesSwap>,
    _creator: Pubkey, 
    _topic_id: u64,
    amount_specified: u64, // Gross amount user wants to swap (if amount_specified_is_input=true)
    sqrt_price_limit_x64: u128, 
    min_amount_out: u64, // Minimum output user accepts (for exact-in slippage)
    is_yes_to_usdb: bool, // true if swapping YES token (A) for USDB (B)
) -> Result<()> {
    require!(ctx.accounts.topic.topic_id == _topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, _creator, PredictionMarketError::CreatorMismatch);

    {
        let yes_pool = &ctx.accounts.yes_pool;
        require!(yes_pool.active, PredictionMarketError::PoolNotActive);
        require!(yes_pool.liquidity > 0, PredictionMarketError::InsufficientLiquidity);
    }

    // For yes_pool: YES token is A, USDB is B. Price is YES/USDB.
    // is_yes_to_usdb = true  => swapping YES (A) for USDB (B). This is A -> B.
    // is_yes_to_usdb = false => swapping USDB (B) for YES (A). This is B -> A.
    let a_to_b = is_yes_to_usdb;
    let amount_specified_is_input = true; // Current implementation assumes exact_in

    let user_swap_computation = {
        let yes_pool = &ctx.accounts.yes_pool;
        match swap_math::compute_swap(
            amount_specified,    
            yes_pool.fee_rate,   
            yes_pool.liquidity,
            yes_pool.sqrt_price, 
            sqrt_price_limit_x64,
            amount_specified_is_input,
            a_to_b,
        ) {
            Ok(res) => res,
            Err(e) => {
                msg!("User swap computation error: {:?}", e);
                return Err(PredictionMarketError::SwapCalculationError.into());
            }
        }
    };

    // For exact_in, total input from user is `amount_specified`.
    // `swap_computation.amount_in` is the portion of input used for actual swap (net of fee).
    // `swap_computation.fee_amount` is the fee part.
    // `amount_specified` should equal `swap_computation.amount_in + swap_computation.fee_amount`.
    
    // Slippage check for exact_in
    require!(user_swap_computation.amount_out >= min_amount_out, PredictionMarketError::SlippageExceeded);
    
    let topic_key = ctx.accounts.topic.key();
    let yes_pool_signer_seeds: &[&[&[u8]]] = &[&[
        b"yes_pool",
        topic_key.as_ref(),
        &[ctx.bumps.yes_pool], 
    ]];

    // Perform main user token transfers
    if a_to_b { // YES (input) -> USDB (output)
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
            amount_specified, // User sends gross YES
            PREDICTION_TOKEN_DECIMALS,
        )?;
        if user_swap_computation.amount_out > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token_interface::TransferChecked {
                        from: ctx.accounts.pool_usdb_account.to_account_info(),
                        to: ctx.accounts.user_usdb_account.to_account_info(),
                        mint: ctx.accounts.usdb_mint.to_account_info(),
                        authority: ctx.accounts.yes_pool.to_account_info(),
                    },
                    yes_pool_signer_seeds,
                ),
                user_swap_computation.amount_out, // User receives net USDB
                PREDICTION_TOKEN_DECIMALS,
            )?;
        }
    } else { // USDB (input) -> YES (output)
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
            amount_specified, // User sends gross USDB
            PREDICTION_TOKEN_DECIMALS,
        )?;
        if user_swap_computation.amount_out > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token_interface::TransferChecked {
                        from: ctx.accounts.pool_yes_account.to_account_info(),
                        to: ctx.accounts.user_yes_account.to_account_info(),
                        mint: ctx.accounts.yes_token_mint.to_account_info(),
                        authority: ctx.accounts.yes_pool.to_account_info(),
                    },
                    yes_pool_signer_seeds,
                ),
                user_swap_computation.amount_out, // User receives net YES
                PREDICTION_TOKEN_DECIMALS,
            )?;
        }
    }

    // Fee Processing: All fees to be collected in USDB
    let fee_amount_in_input_token = user_swap_computation.fee_amount;
    let mut final_sqrt_price = user_swap_computation.next_price;

    if fee_amount_in_input_token > 0 {
        if a_to_b { // Input was YES, fee is in YES. Convert this YES fee to USDB.
            let fee_conversion_computation = {
                let yes_pool = &ctx.accounts.yes_pool;
                match swap_math::compute_swap(
                    fee_amount_in_input_token, // Amount of YES fee to convert
                    0,                         // NO FEE on internal fee conversion
                    yes_pool.liquidity,        
                    user_swap_computation.next_price, // SqrtPrice AFTER user's main swap
                    0,                         // No specific price limit for this internal A->B swap
                    true,                      // amount_specified_is_input for fee conversion
                    true,                      // a_to_b = true (YES -> USDB)
                ) {
                    Ok(res) => res,
                    Err(e) => {
                        msg!("Fee conversion swap computation error: {:?}", e);
                        return Err(PredictionMarketError::SwapCalculationError.into()); // Or a more specific error
                    }
                }
            };

            let usdb_fee_to_collect = fee_conversion_computation.amount_out;
            if usdb_fee_to_collect > 0 {
                transfer_checked(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token_interface::TransferChecked {
                            from: ctx.accounts.pool_usdb_account.to_account_info(),
                            to: ctx.accounts.usdb_fee.to_account_info(),
                            mint: ctx.accounts.usdb_mint.to_account_info(),
                            authority: ctx.accounts.yes_pool.to_account_info(),
                        },
                        yes_pool_signer_seeds,
                    ),
                    usdb_fee_to_collect,
                    PREDICTION_TOKEN_DECIMALS,
                )?;
            }
            final_sqrt_price = fee_conversion_computation.next_price; // Update price after fee conversion
        } else { // Input was USDB, fee is already in USDB.
            let usdb_fee_to_collect = fee_amount_in_input_token;
            if usdb_fee_to_collect > 0 {
                transfer_checked(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token_interface::TransferChecked {
                            from: ctx.accounts.pool_usdb_account.to_account_info(),
                            to: ctx.accounts.usdb_fee.to_account_info(),
                            mint: ctx.accounts.usdb_mint.to_account_info(),
                            authority: ctx.accounts.yes_pool.to_account_info(),
                        },
                        yes_pool_signer_seeds,
                    ),
                    usdb_fee_to_collect,
                    PREDICTION_TOKEN_DECIMALS,
                )?;
            }
            // final_sqrt_price remains user_swap_computation.next_price
        }
    }

    // Update pool state at the end
    {
        let yes_pool = &mut ctx.accounts.yes_pool;
        yes_pool.sqrt_price = final_sqrt_price;
        yes_pool.tick_current_index = tick_index_from_sqrt_price(&final_sqrt_price);
        let price_u128 = ((final_sqrt_price as u128 * final_sqrt_price as u128) >> 64) as u128;
        yes_pool.current_price = ((price_u128 * 10u128.pow(PREDICTION_TOKEN_DECIMALS as u32)) >> 64) as u64;
    }

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        topic: ctx.accounts.topic.key(),
        amount_in: amount_specified, 
        amount_out: user_swap_computation.amount_out,
        is_yes_pool: true,
        is_token_to_usdb: is_yes_to_usdb,
    });

    Ok(())
}

pub fn no_swap(
    ctx: Context<NoSwap>, 
    _creator: Pubkey, 
    _topic_id: u64, 
    amount_specified: u64, // Gross amount user wants to swap
    sqrt_price_limit_x64: u128, 
    min_amount_out: u64, // Minimum output user accepts
    is_no_to_usdb: bool, // true if swapping NO token (A) for USDB (B)
) -> Result<()> {
    require!(ctx.accounts.topic.topic_id == _topic_id, PredictionMarketError::InvalidTopicId);
    require_eq!(ctx.accounts.topic.creator, _creator, PredictionMarketError::CreatorMismatch);

    {
        let no_pool = &ctx.accounts.no_pool;
        require!(no_pool.active, PredictionMarketError::PoolNotActive);
        require!(no_pool.liquidity > 0, PredictionMarketError::InsufficientLiquidity);
    }

    let a_to_b = is_no_to_usdb;
    let amount_specified_is_input = true;

    let user_swap_computation = {
        let no_pool = &ctx.accounts.no_pool;
        match swap_math::compute_swap(
            amount_specified,
            no_pool.fee_rate,
            no_pool.liquidity,
            no_pool.sqrt_price,
            sqrt_price_limit_x64,
            amount_specified_is_input,
            a_to_b,
        ) {
            Ok(res) => res,
            Err(e) => {
                msg!("User swap computation error (no_swap): {:?}", e);
                return Err(PredictionMarketError::SwapCalculationError.into());
            }
        }
    };

    require!(user_swap_computation.amount_out >= min_amount_out, PredictionMarketError::SlippageExceeded);

    let topic_key = ctx.accounts.topic.key();
    let no_pool_signer_seeds: &[&[&[u8]]] = &[&[
        b"no_pool",
        topic_key.as_ref(),
        &[ctx.bumps.no_pool],
    ]];

    // Perform main user token transfers
    if a_to_b { // NO (input) -> USDB (output)
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
            amount_specified,
            PREDICTION_TOKEN_DECIMALS,
        )?;
        if user_swap_computation.amount_out > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token_interface::TransferChecked {
                        from: ctx.accounts.pool_usdb_account.to_account_info(),
                        to: ctx.accounts.user_usdb_account.to_account_info(),
                        mint: ctx.accounts.usdb_mint.to_account_info(),
                        authority: ctx.accounts.no_pool.to_account_info(),
                    },
                    no_pool_signer_seeds,
                ),
                user_swap_computation.amount_out,
                PREDICTION_TOKEN_DECIMALS,
            )?;
        }
    } else { // USDB (input) -> NO (output)
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
            amount_specified,
            PREDICTION_TOKEN_DECIMALS,
        )?;
        if user_swap_computation.amount_out > 0 {
            transfer_checked(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    token_interface::TransferChecked {
                        from: ctx.accounts.pool_no_account.to_account_info(),
                        to: ctx.accounts.user_no_account.to_account_info(),
                        mint: ctx.accounts.no_token_mint.to_account_info(),
                        authority: ctx.accounts.no_pool.to_account_info(),
                    },
                    no_pool_signer_seeds,
                ),
                user_swap_computation.amount_out,
                PREDICTION_TOKEN_DECIMALS,
            )?;
        }
    }

    let fee_amount_in_input_token = user_swap_computation.fee_amount;
    let mut final_sqrt_price = user_swap_computation.next_price;

    if fee_amount_in_input_token > 0 {
        if a_to_b {
            let fee_conversion_computation = {
                let no_pool = &ctx.accounts.no_pool;
                match swap_math::compute_swap(
                    fee_amount_in_input_token,
                    0,
                    no_pool.liquidity,
                    user_swap_computation.next_price,
                    0,
                    true,
                    true,
                ) {
                    Ok(res) => res,
                    Err(e) => {
                        msg!("Fee conversion swap computation error (no_swap): {:?}", e);
                        return Err(PredictionMarketError::SwapCalculationError.into());
                    }
                }
            };

            let usdb_fee_to_collect = fee_conversion_computation.amount_out;
            if usdb_fee_to_collect > 0 {
                transfer_checked(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token_interface::TransferChecked {
                            from: ctx.accounts.pool_usdb_account.to_account_info(),
                            to: ctx.accounts.usdb_fee.to_account_info(),
                            mint: ctx.accounts.usdb_mint.to_account_info(),
                            authority: ctx.accounts.no_pool.to_account_info(),
                        },
                        no_pool_signer_seeds,
                    ),
                    usdb_fee_to_collect,
                    PREDICTION_TOKEN_DECIMALS,
                )?;
            }
            final_sqrt_price = fee_conversion_computation.next_price;
        } else {
            let usdb_fee_to_collect = fee_amount_in_input_token;
            if usdb_fee_to_collect > 0 {
                transfer_checked(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        token_interface::TransferChecked {
                            from: ctx.accounts.pool_usdb_account.to_account_info(),
                            to: ctx.accounts.usdb_fee.to_account_info(),
                            mint: ctx.accounts.usdb_mint.to_account_info(),
                            authority: ctx.accounts.no_pool.to_account_info(),
                        },
                        no_pool_signer_seeds,
                    ),
                    usdb_fee_to_collect,
                    PREDICTION_TOKEN_DECIMALS,
                )?;
            }
        }
    }

    // Update pool state at the end
    {
        let no_pool = &mut ctx.accounts.no_pool;
        no_pool.sqrt_price = final_sqrt_price;
        no_pool.tick_current_index = tick_index_from_sqrt_price(&final_sqrt_price);
        let price_u128 = ((final_sqrt_price as u128 * final_sqrt_price as u128) >> 64) as u128;
        no_pool.current_price = ((price_u128 * 10u128.pow(PREDICTION_TOKEN_DECIMALS as u32)) >> 64) as u64;
    }

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        topic: ctx.accounts.topic.key(),
        amount_in: amount_specified,
        amount_out: user_swap_computation.amount_out,
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
        seeds = [b"yes_pool_usdb", topic.key().as_ref()],
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
    pub amount_in: u64, // Gross amount specified by user for input
    pub amount_out: u64, // Net amount received by user
    pub is_yes_pool: bool,
    pub is_token_to_usdb: bool,
}
