use anchor_lang::prelude::*;

#[error_code]
pub enum PredictionMarketError {
    #[msg("Topic is still active")]
    TopicStillActive,

    #[msg("Pool is still active")]
    PoolStillActive,

    #[msg("Pool is not empty, cannot be closed")]
    NonEmptyPool,

    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    #[msg("Amount must be greater than zero")]
    AmountMustBeGreaterThanZero,

    #[msg("Insufficient balance")]
    InsufficientBalance,

    #[msg("Excessive price impact")]
    ExcessiveSlippage,

    #[msg("Topic has ended")]
    TopicEnded,

    #[msg("Invalid winning token")]
    InvalidWinningToken,

    #[msg("Operation unauthorized")]
    Unauthorized,

    #[msg("Oracle admin unauthorized")]
    UnauthorizedOracle,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Invalid topic title")]
    InvalidTopicTitle,

    #[msg("Invalid initial price")]
    InvalidInitialPrice,

    #[msg("Invalid liquidity range")]
    InvalidLiquidityRange,

    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Slippage exceeded limit")]
    SlippageExceeded,

    #[msg("The number of strategy accounts does not match the registry")]
    InvalidRemainingAccountsLength,

    #[msg("Strategy account order or PDA mismatch")]
    InvalidStrategyAccountOrder,

    #[msg("Invalid strategy PDA")]
    InvalidStrategyPda,

    #[msg("Invalid strategy ID")]
    InvalidStrategyId,

    #[msg("Numerical overflow")]
    Overflow,

    #[msg("Invalid program ID")]
    InvalidProgramId,

    #[msg("Invalid PDA")]
    InvalidPDA,

    #[msg("Strategy not found")]
    StrategyNotFound,

    #[msg("No balance to withdraw")]
    NoBalanceToWithdraw,

    #[msg("Withdraw amount exceeds balance")]
    WithdrawAmountExceedsBalance,

    #[msg("Invalid time difference")]
    InvalidTimeDiff,

    #[msg("Invalid principal percent")]
    InvalidPrincipalPercent,

    #[msg("Invalid APR")]
    InvalidApr,

    #[msg("Strategy limit reached")]
    StrategyLimitReached,

    #[msg("Strategy already in this state")]
    StrategyAlreadyInState,

    #[msg("APR not changed")]
    AprNotChanged,
    #[msg("Topic not ended")]
    TopicNotEnded,
    #[msg("Insufficient swap liquidity")]
    InsufficientSwapLiquidity,

    #[msg("Account is not writable")]
    AccountNotWritable,

    #[msg("Invalid topic ID")]
    InvalidTopicId,

    #[msg("Creator mismatch")]
    CreatorMismatch,
}
