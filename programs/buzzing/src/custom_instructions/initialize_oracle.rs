use anchor_lang::prelude::*;

use crate::state::Oracle;

pub fn handler(ctx: Context<InitializeOracle>) -> Result<()> {
    let oracle = &mut ctx.accounts.oracle;
    oracle.admin = ctx.accounts.admin.key();
    oracle.bump = ctx.bumps.oracle;

    // 发出Oracle初始化事件
    emit!(OracleInitializedEvent {
        oracle: oracle.key(),
        admin: oracle.admin,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeOracle<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Oracle::INIT_SPACE,
        seeds = [b"oracle"],
        bump
    )]
    pub oracle: Account<'info, Oracle>,

    pub system_program: Program<'info, System>,
}

// Oracle初始化事件
#[event]
pub struct OracleInitializedEvent {
    pub oracle: Pubkey,
    pub admin: Pubkey,
    pub timestamp: i64,
}
