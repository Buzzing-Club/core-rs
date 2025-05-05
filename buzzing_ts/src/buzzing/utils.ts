import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { program, connection } from './config';
import { getAccount, Account } from "@solana/spl-token";


export async function getVault(): Promise<void>{
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    program.programId
  );
  const vaultAccount = await program.account.vault.fetch(vault);
  console.log("vaultAccount: ");
  console.log("admin: ",vaultAccount.admin.toString());
  console.log("total_all_principal: ",vaultAccount.totalAllPrincipal.toNumber()/1e6);
  console.log("total_all_interest: ",vaultAccount.totalAllInterest.toNumber()/1e6);
  console.log("available_funds: ",vaultAccount.availableFunds.toNumber()/1e6);
  console.log("remaining_funds: ",vaultAccount.remainingFunds.toNumber()/1e6);
  console.log("guarantee_funds: ",vaultAccount.guaranteeFunds.toNumber()/1e6);
  // 将时间戳转换为日期对象并格式化为字符串输出
  const lastSettleDate = new Date(vaultAccount.lastSettleTs * 1000); // 假设时间戳为秒级，转换为毫秒级
  console.log("last_settle_ts: ", lastSettleDate.toLocaleString());
  console.log("fee: ",vaultAccount.fee.toNumber());

}


export async function getTopic(creator: PublicKey, topicId: number): Promise<void> {
  const id = Buffer.alloc(8);
  id.writeBigUInt64LE(BigInt(topicId));

  const [topic] = PublicKey.findProgramAddressSync(
    [Buffer.from('topic'),id,creator.toBuffer()],
    program.programId
  );
  const topicAccount = await program.account.topic.fetch(topic);
  
  console.log('topicAccount:');
  console.log('topicId:', topicAccount.topicId.toNumber());
  console.log('creator:', topicAccount.creator.toString());
  console.log('yesMint:', topicAccount.yesMint.toString());
  console.log('noMint:', topicAccount.noMint.toString());
  console.log('yesPool:', topicAccount.yesPool.toString());
  console.log('noPool:', topicAccount.noPool.toString());
  console.log('totalToken:', topicAccount.toltalToken.toNumber()/1e6);
  console.log('initialPrice:', topicAccount.initialPrice.toNumber());
  console.log('isEnded:', topicAccount.isEnded);
  console.log('winningToken:', topicAccount.winningToken?.toString() ?? 'null');
  console.log('topicIpfsHash:', topicAccount.topicIpfsHash.toString());
}




export async function getLiquidityPool(topic: PublicKey, seed: string): Promise<void> {
  const [liquidityPool] = PublicKey.findProgramAddressSync(
    [Buffer.from(seed), topic.toBuffer()],
    program.programId
  );
  const poolAccount = await program.account.liquidityPool.fetch(liquidityPool);
  
  console.log('LiquidityPool Account:');
  console.log('usdbMint:', poolAccount.usdbMint.toString());
  console.log('tokenMint:', poolAccount.tokenMint.toString());
  console.log('currentPrice:', poolAccount.currentPrice.toString());
  console.log('active:', poolAccount.active);
}

export async function getTokenBalance(name: string, tokenName: string,tokenAccountAddress: string) {
    const pubkey = new PublicKey(tokenAccountAddress);
  
    try {
      const tokenAccountInfo: Account = await getAccount(connection, pubkey);
      console.log(`${name} ${tokenName}:`,Number(tokenAccountInfo.amount)/1e6);
      return tokenAccountInfo.amount;
    } catch (err) {
      console.error("Failed to get token account:", err);
    }
  }



// 新增获取函数
export async function getMarket(): Promise<void> {
  const [market] = PublicKey.findProgramAddressSync(
    [Buffer.from('market')],
    program.programId
  );
  const marketAccount = await program.account.market.fetch(market);
  
  console.log('Market Account:');
  console.log('nextId:', marketAccount.nextId.toNumber());
}

export async function getStrategyState(strategyId: number): Promise<void> {
  const strategySeed = Buffer.from([strategyId]);
  const [strategy] = PublicKey.findProgramAddressSync(
    [Buffer.from('strategy'), strategySeed],
    program.programId
  );
  const strategyAccount = await program.account.strategyState.fetch(strategy);
  
  console.log('StrategyState:');
  console.log('strategyId:', strategyAccount.id);
  console.log('used_principal_percent:', strategyAccount.usedPrincipalPercent);
  console.log('APR:', strategyAccount.apr);
  console.log('total_principal:', strategyAccount.totalPrincipal.toNumber()/1e6);
  console.log('total_interest:', strategyAccount.totalInterest.toNumber()/1e6);
  console.log('total_user:', strategyAccount.totalUser.toNumber());
  console.log('used_principal_percent:', strategyAccount.usedPrincipalPercent);
  console.log('active:', strategyAccount.active);
  console.log('last_update_ts:', new Date(strategyAccount.lastUpdateTs.toNumber() * 1000).toLocaleString());
}



export async function getGlobalStrategyRegistry(): Promise<void> {
  const [registry] = PublicKey.findProgramAddressSync(
    [Buffer.from('registry')],
    program.programId
  );
  
  const registryAccount = await program.account.globalStrategyRegistry.fetch(registry);
  
  console.log('GlobalStrategyRegistry:');
  // console.log('admin:', registryAccount.admin.toString());
  console.log('bump:', registryAccount.bump);
  console.log('strategyIds:', registryAccount.strategyIds.map(id => id));
}


// export interface Receipt {
//   user: PublicKey;
//   strategyId: number;
//   principal: BN;
//   interest: BN;
//   lastSettleTs: BN;
//   bump: number;
// }

export async function getReceipt(strategyId: number, user: PublicKey): Promise<void> {
  const strategySeed = Buffer.from([strategyId]);
  const [receipt] = PublicKey.findProgramAddressSync(
    [Buffer.from('receipt'), strategySeed, user.toBuffer()],
    program.programId
  );

  const receiptAccount = await program.account.receipt.fetch(receipt);
  
  console.log('Receipt Account:');
  console.log('user:', receiptAccount.user.toString());
  console.log('strategyId:', receiptAccount.strategyId);
  console.log('principal:', receiptAccount.principal.toNumber()/1e6);
  console.log('interest:', receiptAccount.interest.toNumber()/1e6);
  console.log('lastSettleTs:', new Date(receiptAccount.lastSettleTs.toNumber() * 1000).toLocaleString());
  // console.log('bump:', receiptAccount.bump);
}