use anchor_lang::prelude::*;

use crate::errors::*;
use crate::state::{GlobalStrategyRegistry, StrategyState};

pub fn add_strategy(ctx: Context<AddStrategy>, used_principal_percent: u8, apr: u16) -> Result<()> {
    // 参数验证
    require!(
        used_principal_percent <= 100,
        PredictionMarketError::InvalidPrincipalPercent
    );
    require!(apr > 0, PredictionMarketError::InvalidApr);

    let registry = &mut ctx.accounts.registry;
    let strategy = &mut ctx.accounts.strategy_state;
    let clock = Clock::get()?;

    // // 检查策略数量是否达到上限
    // require!(
    //     registry.strategy_ids.len() < u8::MAX as usize,
    //     PredictionMarketError::StrategyLimitReached
    // );

    // 自动分配 strategy_id
    let strategy_id = (registry.strategy_ids.len() + 1) as u8;

    // 更新 registry
    registry.strategy_ids.push(strategy_id);

    // 初始化新策略状态
    strategy.id = strategy_id;
    strategy.used_principal_percent = used_principal_percent;
    strategy.apr = apr;
    strategy.last_update_ts = clock.unix_timestamp;
    strategy.active = true;
    strategy.bump = ctx.bumps.strategy_state;

    // 记录策略添加事件
    emit!(StrategyEvent {
        strategy_id,
        event_type: StrategyEventType::Added,
        used_principal_percent,
        apr,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

pub fn toggle_strategy(ctx: Context<ToggleStrategy>, strategy_id: u8, active: bool) -> Result<()> {
    let strategy = &mut ctx.accounts.strategy_state;
    let clock = Clock::get()?;

    // 检查策略是否已经处于目标状态
    require!(
        strategy.active != active,
        PredictionMarketError::StrategyAlreadyInState
    );

    require!(strategy.id == strategy_id, PredictionMarketError::InvalidStrategyId);

    strategy.active = active;

    // 记录策略状态变更事件
    emit!(StrategyEvent {
        strategy_id: strategy.id,
        event_type: StrategyEventType::Toggled,
        used_principal_percent: strategy.used_principal_percent,
        apr: strategy.apr,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

pub fn update_strategy_apr(ctx: Context<UpdateStrategyApr>, strategy_id: u8, new_apr: u16) -> Result<()> {
    // 参数验证
    require!(new_apr > 0, PredictionMarketError::InvalidApr);

    let strategy = &mut ctx.accounts.strategy_state;
    let clock = Clock::get()?;

    require!(strategy.id == strategy_id, PredictionMarketError::InvalidStrategyId);

    // 检查新APY是否与当前不同
    require!(
        strategy.apr != new_apr,
        PredictionMarketError::AprNotChanged
    );

    strategy.apr = new_apr;

    // 记录APY更新事件
    emit!(StrategyEvent {
        strategy_id: strategy.id,
        event_type: StrategyEventType::AprUpdated,
        used_principal_percent: strategy.used_principal_percent,
        apr: new_apr,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct AddStrategy<'info> {
    #[account(
        mut,
        has_one = admin,
        seeds = [b"registry"],
        bump = registry.bump,
    )]
    pub registry: Account<'info, GlobalStrategyRegistry>,

    /// CHECK: 新策略 ID = registry.strategy_ids.len() as u8
    #[account(
        init,
        payer = admin,
        seeds = [
            b"strategy", 
            &((registry.strategy_ids.len() + 1) as u8).to_le_bytes()[..],
        ],
        bump,
        space = 8 + StrategyState::INIT_SPACE,
    )]
    pub strategy_state: Account<'info, StrategyState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(strategy_id: u8)]
pub struct ToggleStrategy<'info> {
    #[account(
        has_one = admin,
        seeds = [b"registry"],
        bump = registry.bump,
    )]
    pub registry: Account<'info, GlobalStrategyRegistry>,

    #[account(
        mut,
        seeds = [b"strategy", &strategy_id.to_le_bytes()],
        bump = strategy_state.bump
    )]
    pub strategy_state: Account<'info, StrategyState>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(strategy_id: u8)]
pub struct UpdateStrategyApr<'info> {
    #[account(
         has_one = admin,
        seeds = [b"registry"],
        bump = registry.bump,
       
    )]
    pub registry: Account<'info, GlobalStrategyRegistry>,

    #[account(
        mut,
        seeds = [b"strategy", &strategy_id.to_le_bytes()],
        bump = strategy_state.bump
    )]
    pub strategy_state: Account<'info, StrategyState>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

#[event]
pub struct StrategyEvent {
    pub strategy_id: u8,
    pub event_type: StrategyEventType,
    pub used_principal_percent: u8,
    pub apr: u16,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum StrategyEventType {
    Added,
    Toggled,
    AprUpdated,
}
