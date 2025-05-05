import { userKeypair1, program, usdc_mint, usdb_mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, SystemProgram, PublicKey, getAssociatedTokenAddress } from './config';
import { Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Buffer } from 'buffer';

async function swapUsdcUsdb(
  userKeypair: Keypair,
  amount: number,
  isUsdcToUsdb: boolean
): Promise<void> {
  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [vaultUsdc] = PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    program.programId,
  );

  const [vaultUsdb] =  PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    program.programId,
  );

  const userUsdcTokenAccount = await getAssociatedTokenAddress(
    usdc_mint,
    userKeypair.publicKey
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const transaction = await program.methods
    .swapUsdcUsdb(new anchor.BN(amount), isUsdcToUsdb)
    .accounts({
      user: userKeypair.publicKey,
      // vault: vault,
      // vaultUsdc: vaultUsdc,
      // vaultUsdb: vaultUsdb,
      // userUsdc: userUsdcTokenAccount,
      // userUsdb: userUsdbTokenAccount,
      usdbMint: usdb_mint,
      usdcMint: usdc_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("USDC/USDB swap completed with transaction:", transaction);
}

// const userKeypair = userKeypair1;
// const amount = 1500 * 1e6;
// const isUsdcToUsdb = true;

// swapUsdcUsdb(userKeypair, amount, isUsdcToUsdb).then(() => {
//   console.log("USDC/USDB swap completed successfully");
// }).catch((error) => {
//   console.error("Error performing USDC/USDB swap:", error);
// }); 

const userKeypair = userKeypair1;
const amount = 2000 * 1e6;
const isUsdcToUsdb = true;

swapUsdcUsdb(userKeypair, amount, isUsdcToUsdb).then(() => {
  console.log("USDC/USDB swap completed successfully");
}).catch((error) => {
  console.error("Error performing USDC/USDB swap:", error);
}); 