use anchor_lang::prelude::*;
// use integer_sqrt::IntegerSquareRoot;

use crate::constants::{TICK_LOWER, TICK_UPPER, SCALE, MAX_TOKEN_AMOUNT};
use crate::errors::*;

// /// 转移代币 - 不需要签名
// pub fn transfer_token<'info>(
//     token_program: &Interface<'info, TokenInterface>,
//     from: &InterfaceAccount<'info, TokenAccount>,
//     to: &InterfaceAccount<'info, TokenAccount>,
//     authority: &AccountInfo<'info>,
//     mint: &AccountInfo<'info>,
//     amount: u64,
//     decimals: u8,
// ) -> Result<()> {
//     if amount > 0 {
//         let cpi_ctx = CpiContext::new(
//             token_program.to_account_info(),
//             token_interface::TransferChecked {
//                 from: from.to_account_info(),
//                 to: to.to_account_info(),
//                 mint: mint.to_account_info(),
//                 authority: authority.to_account_info(),
//             },
//         );
//         token_interface::transfer_checked(cpi_ctx, amount, decimals)?;
//     }
//     Ok(())
// }

// /// 转移代币 - 需要签名
// pub fn transfer_token_with_signer<'info>(
//     token_program: &Interface<'info, TokenInterface>,
//     from: &InterfaceAccount<'info, TokenAccount>,
//     to: &InterfaceAccount<'info, TokenAccount>,
//     authority: &AccountInfo<'info>,
//     mint: &AccountInfo<'info>,
//     amount: u64,
//     decimals: u8,
//     signer: &[&[&[u8]]],
// ) -> Result<()> {
//     if amount > 0 {
//         let cpi_ctx = CpiContext::new_with_signer(
//             token_program.to_account_info(),
//             token_interface::TransferChecked {
//                 from: from.to_account_info(),
//                 to: to.to_account_info(),
//                 mint: mint.to_account_info(),
//                 authority: authority.to_account_info(),
//             },
//             signer,
//         );
//         token_interface::transfer_checked(cpi_ctx, amount, decimals)?;
//     }
//     Ok(())
// }


pub fn calculate_token_amount(usdb_amount: u64, price: u64) -> Result<u64> {
    // 将 price 转换为 sqrtPriceX96 (使用整数形式避免浮动点数)
    let sqrt_price_x96 = (price as u128 * SCALE as u128) / 1; // 价格转换为固定点数

    // 将 TICK 转换为 sqrtPriceX96（同样使用整数）
    let sqrt_price_lower = (TICK_LOWER as u128 * SCALE as u128) / 1;
    let sqrt_price_upper = (TICK_UPPER as u128 * SCALE as u128) / 1;

    // 将 `usdb_amount` 转换为固定点数（乘以 SCALE）
    let usdb_amount_fp = usdb_amount as u128 * SCALE as u128;

    // 计算流动性：流动性 = (sqrtPriceUpper - sqrtPriceLower) * usdb_amount
    let liquidity = (sqrt_price_upper - sqrt_price_lower) * usdb_amount_fp;

    // 计算 token 数量：token_amount = (liquidity * (sqrtPriceX96 - sqrtPriceLower)) / sqrtPriceX96
    let liquidity_fp = liquidity * (sqrt_price_x96 - sqrt_price_lower);
    let token_amount_fp = liquidity_fp / sqrt_price_x96;

    // 限制最大 token 数量
    let token_amount = if token_amount_fp > MAX_TOKEN_AMOUNT as u128 {
        (MAX_TOKEN_AMOUNT - 1) as u128
    } else {
        token_amount_fp
    };

    Ok(token_amount as u64)
}

// 计算交易输出金额
// pub fn calculate_swap_output(
//     amount_in: u64,
//     reserve_in: u64,
//     reserve_out: u64,
//     fee_rate: u64,
//     slippage_tolerance: u64,
//     is_token_to_usdb: bool,
// ) -> Result<(u64, u64)> {
//     // 检查输入金额
//     require!(amount_in > 0, PredictionMarketError::InvalidAmount);

//     // 检查流动性
//     require!(
//         reserve_in > 0 && reserve_out > 0,
//         PredictionMarketError::InsufficientLiquidity
//     );

//     // 计算输出金额 (x * y = k)
//     let amount_out = amount_in
//         .checked_mul(reserve_out)
//         .unwrap()
//         .checked_div(reserve_in.checked_add(amount_in).unwrap())
//         .unwrap();

//     // 计算手续费（总是从 USDB 中扣除）
//     let fee = if is_token_to_usdb {
//         // YES/NO -> USDB: 从输出的 USDB 中收取手续费
//         amount_out
//             .checked_mul(fee_rate)
//             .unwrap()
//             .checked_div(1000)
//             .unwrap()
//     } else {
//         // USDB -> YES/NO: 从输入的 USDB 中收取手续费
//         amount_in
//             .checked_mul(fee_rate)
//             .unwrap()
//             .checked_div(1000)
//             .unwrap()
//     };

//     // 检查滑点
//     let minimum_amount_out = amount_out
//         .checked_mul(1000 - slippage_tolerance)
//         .unwrap()
//         .checked_div(1000)
//         .unwrap();
//     require!(
//         amount_out >= minimum_amount_out,
//         PredictionMarketError::SlippageExceeded
//     );

//     Ok((amount_out, fee))
// }


pub fn calculate_swap_output(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_rate: u64,
    slippage_tolerance: u64,
    is_token_to_usdb: bool,
) -> Result<(u64, u64)> {
    // 检查输入金额
    if amount_in == 0 {
        return Err(PredictionMarketError::InvalidAmount.into());
    }

    // 检查流动性
    if reserve_in == 0 || reserve_out == 0 {
        return Err(PredictionMarketError::InsufficientLiquidity.into());
    }

    // 计算输出金额 (x * y = k)
    let amount_out = (amount_in * reserve_out) / (reserve_in + amount_in);

    // 计算手续费（总是从 USDB 中扣除）
    let fee = if is_token_to_usdb {
        // YES/NO -> USDB: 从输出的 USDB 中收取手续费
        (amount_out * fee_rate) / 1000
    } else {
        // USDB -> YES/NO: 从输入的 USDB 中收取手续费
        (amount_in * fee_rate) / 1000
    };

    // 检查滑点
    let minimum_amount_out = (amount_out * (1000 - slippage_tolerance)) / 1000;
    if amount_out < minimum_amount_out {
        return Err(PredictionMarketError::SlippageExceeded.into());
    }

    Ok((amount_out, fee))
}


pub fn update_strategy_interest(total_principal: u64, apr: u16, last_update_ts: i64, now: i64) -> u64 {
    let elapsed_secs = now - last_update_ts;
    if elapsed_secs <= 0 {
        return 0; // 如果时间未过，返回 0
    }

    let elapsed_years = elapsed_secs as f64 / (365.0 * 24.0 * 3600.0);
    let apr = apr as f64 / 100.0;

    // 计算本期应得的利息
    (total_principal as f64 * apr * elapsed_years) as u64
}


// 计算利息的辅助函数
pub fn calculate_interest(principal: u64, time_diff: i64, interest_rate: u64) -> u64 {
    if time_diff <= 0 {
        return 0;
    }

    // 将时间差转换为年化比例
    let year_fraction = time_diff as f64 / (365.0 * 24.0 * 3600.0);
    let interest_rate = interest_rate as f64 / 100.0;

    // 计算利息
    (principal as f64 * interest_rate * year_fraction) as u64
    
}

