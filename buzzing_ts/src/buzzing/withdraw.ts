import { anchor,userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey,ASSOCIATED_TOKEN_PROGRAM_ID,getAssociatedTokenAddress } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';


async function withdraw(userKeypair: Keypair, strategyId: number, amount: number) {
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );
  
    const [receipt] = PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), Buffer.from([strategyId]), userKeypair.publicKey.toBuffer()],
      program.programId,
    );
  
    const [registry] = PublicKey.findProgramAddressSync(
      [Buffer.from("registry")],
      program.programId,
    );

    const strategyStates: PublicKey[] = [];

    const registryAccount = await program.account.globalStrategyRegistry.fetch(registry);
    for (const id of registryAccount.strategyIds) {
        const strategySeed = Buffer.alloc(1); // u8 用一个字节
        strategySeed.writeUInt8(id); // 写入 strategyId

        const [strategyState] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy"), strategySeed],
            program.programId
        );

        strategyStates.push(strategyState);
    }
    // 转换为 remainingAccounts 格式
    const remainingAccounts = strategyStates.map((pubkey) => ({
        pubkey,
        isWritable: false, // 如果你的程序中会修改它，设为 true
        isSigner: false
    }));
  
    const userUsdbTokenAccount = await getAssociatedTokenAddress(
      usdb_mint,
      userKeypair.publicKey
    );
  
    const [vaultUsdbLiquidity] = PublicKey.findProgramAddressSync(
      [Buffer.from("liquidity")],
      program.programId,
    );
  
    const transaction = await program.methods
      .withdraw(strategyId, new anchor.BN(amount))
      .accounts({
        // user: userKeypair.publicKey,
        // vault: vault,
        receipt: receipt,
        // registry: registry,
        userUsdb: userUsdbTokenAccount,
        // vaultUsdbLiquidity: vaultUsdbLiquidity,
        usdbMint: usdb_mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([userKeypair])
      .remainingAccounts(remainingAccounts)
      .rpc();
    
    console.log("Withdrawal completed with transaction:", transaction);
  }
  
  // module.exports = withdraw; 
  
  
  const strategyId = 1;
  const usdb_amount = 6000*1e6;
  const userKeypair = userKeypair1;
  
  withdraw(userKeypair, strategyId, usdb_amount).then(() => {
    console.log("Deposit completed successfully");
  }).catch((error) => {
    console.error("Error depositing:", error);
  });