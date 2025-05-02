use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub admin: Pubkey,
    pub next_id: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Oracle {
    pub admin: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub admin: Pubkey,
    pub usdc_mint: Pubkey,
    pub usdb_mint: Pubkey,
    pub total_all_principal: u64, // 总资金
    pub total_all_interest: u64,  // 总利息
    pub available_funds: u64, // 总共可使用的资金，包括部分本金和利息，用户提取时才会减少，利息是递增的。
    pub remaining_funds: u64, // 当前可用资金，用于保障用户随时提取
    pub guarantee_funds: u64, // 铸造代币时的抵押资金，1usdb可以铸造1个yes和1个no
    pub last_settle_ts: i64,
    pub fee: u64, // 100=1%手续费
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Topic {
    pub topic_id: u64,
    pub creator: Pubkey,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub yes_pool: Pubkey,
    pub no_pool: Pubkey,
    pub toltal_token: u64,
    pub initial_price: u64,
    pub is_ended: bool,
    pub winning_token: Option<Pubkey>,
    pub bump: u8,
    pub topic_ipfs_hash: [u8; 32],
}

#[account]
#[derive(InitSpace)]
pub struct LiquidityPool {
    pub usdb_mint: Pubkey,
    pub token_mint: Pubkey,
    pub usdb_reserve: Pubkey,
    pub token_reserve: Pubkey,
    pub tick_lower: u64,
    pub tick_upper: u64,
    pub current_price: u64,
    pub active: bool,
}

#[account]
#[derive(InitSpace)]
pub struct Receipt {
    pub user: Pubkey,
    pub strategy_id: u8,
    pub principal: u64,
    pub interest: u64,
    pub last_settle_ts: i64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StrategyState {
    pub id: u8,                     // 策略 ID
    pub used_principal_percent: u8, // 使用的本金比例（例如 20 表示20%）
    pub apr: u16,                   // 年化利率（如300 = 3%）

    pub total_principal: u64, // 所有用户参与该策略的本金总额
    pub total_interest: u64,  // 到目前为止已结算产生的总利息
    pub total_user: u64,      // 总共参与该策略的用户数
    pub last_update_ts: i64,  // 上次结算时间（利息计算用）
    pub active: bool,         // 当前策略是否激活
    pub bump: u8,             // PDA bump
}

#[account]
#[derive(InitSpace)]
pub struct GlobalStrategyRegistry {
    pub admin: Pubkey,
    pub bump: u8,
    #[max_len(20)]
    pub strategy_ids: Vec<u8>, // 当前所有的策略 ID 列表
}
