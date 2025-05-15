use anchor_lang::prelude::*;

use custom_instructions::*;


mod constants;
mod custom_instructions;
mod errors;
mod state;
mod utils;
mod math;


declare_id!("3gvUXvA5CS8Ya42QKbcFEL682ABqSjEHR4XRYQhpBFcw");



#[program]
pub mod buzzing {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>) -> Result<()> {
        custom_instructions::initialize_market::handler(ctx)
    }

    pub fn initialize_oracle(ctx: Context<InitializeOracle>) -> Result<()> {
        custom_instructions::initialize_oracle::handler(ctx)
    }

    pub fn create_topic(ctx: Context<CreateTopic>, topic_ipfs_hash: [u8; 32]) -> Result<()> {
        create_topic::handler(ctx, topic_ipfs_hash)
    }

    pub fn end_topic(ctx: Context<EndTopic>, creator: Pubkey, topic_id: u64, winning_token: Pubkey) -> Result<()> {
        end_topic::handler(ctx, creator, topic_id, winning_token)
    }

    pub fn redeem(ctx: Context<Redeem>,creator: Pubkey, topic_id: u64) -> Result<()> {
        redeem::handler(ctx,creator, topic_id)
    }

    pub fn close_pools(ctx: Context<ClosePools>, creatorx:Pubkey, topic_id: u64) -> Result<()> {
        close_pools::handler(ctx, creatorx, topic_id)
    }

    pub fn close_pools_v2(ctx: Context<ClosePoolsV2>, topic_id: u64) -> Result<()> {
        close_pools_v2::handler(ctx, topic_id)
    }

    pub fn swap_usdc_usdb(
        ctx: Context<SwapUsdcUsdb>,
        amount: u64,
        is_usdc_to_usdb: bool,
    ) -> Result<()> {
        swap_usdc_usdb::handler(ctx, amount, is_usdc_to_usdb)
    }


    pub fn yes_swap(
        ctx: Context<YesSwap>, 
        creator: Pubkey, 
        topic_id: u64, 
        amount_specified: u64, 
        sqrt_price_limit_x64: u128,
        min_amount_out: u64,
        is_yes_to_usdb: bool,
    ) -> Result<()> {
        swap::yes_swap(ctx, creator, topic_id, amount_specified, sqrt_price_limit_x64, min_amount_out, is_yes_to_usdb)
    }

    pub fn no_swap(
        ctx: Context<NoSwap>, 
        creator: Pubkey, 
        topic_id: u64, 
        amount_specified: u64, 
        sqrt_price_limit_x64: u128,
        min_amount_out: u64,
        is_no_to_usdb: bool,
    ) -> Result<()> {
        swap::no_swap(ctx, creator, topic_id, amount_specified, sqrt_price_limit_x64, min_amount_out, is_no_to_usdb)
    }

    pub fn deposit<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Deposit<'info>>, strategy_id: u8, amount: u64) -> Result<()>
    where
        'c: 'info,
    {
        deposit::deposit(ctx, strategy_id, amount)
    }

    pub fn withdraw<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, Withdraw<'info>>, strategy_id: u8, amount: u64) -> Result<()> 
    where
        'c: 'info,
    {
        withdraw::withdraw(ctx, strategy_id, amount)
    }

    pub fn add_strategy(
        ctx: Context<AddStrategy>,
        used_principal_percent: u8,
        apy: u16,
    ) -> Result<()> {
        strategy::add_strategy(ctx, used_principal_percent, apy)
    }

    pub fn toggle_strategy(ctx: Context<ToggleStrategy>, strategy_id: u8, active: bool) -> Result<()> {
        strategy::toggle_strategy(ctx, strategy_id, active)
    }

    pub fn update_strategy_apr(ctx: Context<UpdateStrategyApr>, strategy_id: u8, new_apy: u16) -> Result<()> {
        strategy::update_strategy_apr(ctx, strategy_id, new_apy)
    }

    // pub fn update_global_strategy_registry(ctx: Context<UpdateGlobalStrategyRegistry>, strategy_ids: Vec<u8>) -> Result<()> {
    //     custom_instructions::initialize_market::update_global_strategy_registry(ctx, strategy_ids)
    // }

}   


