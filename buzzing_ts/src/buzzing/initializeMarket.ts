import { program, walletKeypair, usdc_mint, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

async function initializeMarket(walletKeypair: Keypair, usdcMint: PublicKey, usdbMint: PublicKey): Promise<void> {
  const [market] = PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    program.programId,
  );

  console.log("market:", market.toString());

  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  console.log("vault:", vault.toString());

  const [swap] = PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    program.programId,
  );

  console.log("usdcSwap:", swap.toString());

  const [liquidity] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  console.log("usdbLiquidity:", liquidity.toString());

  const [fee] = PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    program.programId,
  );

  console.log("usdbFee:", fee.toString());

  const [usdb] = PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    program.programId,
  );

  console.log("usdbSwap:", usdb.toString());

  const [registry] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  console.log("globalStrategyRegistry: registry,:", registry.toString());

  const transaction = await program.methods
    .initializeMarket()
    .accounts({
      admin: walletKeypair.publicKey,
      // market: market,
      // vault: vault,
      // usdcSwap: swap,
      // usdbLiquidity: liquidity,
      // usdbFee: fee,
      // usdbSwap: usdb,
      // globalStrategyRegistry: registry,
      usdcMint: usdcMint,
      usdbMint: usdbMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Market initialized with transaction:", transaction);
}




// todo: 初始化时，vault的remainging_funds要写入，或者写一个方法
// initializeMarket(walletKeypair, usdc_mint, usdb_mint).then(() => {
//   console.log("Market initialization completed");
// }).catch((error) => {
//   console.error("Error initializing market:", error);
// }); 



// market: GBL8JqGo7WVaZkumvaHUBgcZ9ZWdUTh7ev7XjoM5i2Bs
// vault: FQUixuRk27dMSB1xKZFZ7HKTDSYmWEzfrQdNSyzpPnbJ
// usdcSwap: ZeGh6DNszsYHdPguiZ8VGbd5jQJeruxRzhfABpxntgq
// usdbLiquidity: 7tkkGxw4YxAkM9UNtQmnp1ipp9BTWCnsyVzqLCVGSCKW
// usdbFee: CCVkFQ9WLnyqbpG1MDfrWEkSt6zGPnGdjTa9mC2uipz6
// usdbSwap: Co5GeozKTyWLQrYxLmb9p4MrfUccpsZittehVFz77hgz
// globalStrategyRegistry: registry,: B8qNi3LKaD7bGLAd7qBTXGMNTM9xLjuVWRCvq5fGEBCS



import { getVault, getTokenBalance, getGlobalStrategyRegistry } from './utils';


getVault()
// getTokenBalance('usdcSwap', "usdc", "CT618fveM685HyDWHyRUMp7xhCwqcF14cqchHD6NSKxT" );
// getTokenBalance('usdbLiquidity', 'usdb', 'GahDZjXUBiLwJMwxXgBwMS3rxsE75kL73M7Ak3z8sNa4');
// getTokenBalance('usdbFee', 'usdb', '2XxcbGUxuGK2DjU258Z7wfVWyTJJZofQKccjMgpbXrUn');
// getTokenBalance('usdbSwap', 'usdb', '79e9hPjV9eAsQ1NUVhRMauRmZvT8Ryaoa2SDJoPLPmzu');
// // getGlobalStrategyRegistry();



// total_all_principal:  6125
// total_all_interest:  0.074645
// available_funds:  1335.074645
// remaining_funds:  330.07465
// guarantee_funds:  4.999995
// last_settle_ts:  2025/5/2 12:32:10
// fee:  300