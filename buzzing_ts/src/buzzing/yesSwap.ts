import { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey, getAssociatedTokenAddress } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';
import * as anchor from '@coral-xyz/anchor';

async function yesSwap(
  userKeypair: Keypair,
  topicCreator: PublicKey,
  topicId: number,
  amountIn: number,
  is_yes_to_usdb: boolean
): Promise<void> {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(BigInt(topicId));


  const [topicPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), idBuf, topicCreator.toBuffer()],
    program.programId,
  );

  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [yesPool] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    program.programId,
  );

  const [yesMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const userYesTokenAccount = await getAssociatedTokenAddress(
    yesMint,
    userKeypair.publicKey
  );

  const [poolYesTokenAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    program.programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [poolUsdbAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const [usdbFee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    program.programId,
  );

  const [yesTokenMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const transaction = await program.methods
    // 修复：BigInt 构造函数使用有误，且在 anchor 中通常使用 BN 类型处理数值
    .yesSwap(topicCreator, new anchor.BN(topicId), new anchor.BN(amountIn), is_yes_to_usdb)
    .accounts({
      user: userKeypair.publicKey,
      // topic: topicPda,
      // vault: vault,
      // yesPool: yesPool,
      // userYesAccount: userYesTokenAccount,
      // poolYesAccount: poolYesTokenAccount,
      // userUsdbAccount: userUsdbTokenAccount,
      // poolUsdbAccount: poolUsdbAccount,
      // usdbFee: usdbFee,
      // yesTokenMint: yesTokenMint,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Yes swap completed with transaction:", transaction);
}

const userKeypair = userKeypair1;
const topicId = 5;
const creator = userKeypair.publicKey;
const amountIn = 0.01* 1e6;
const is_yes_to_usdb = false;

yesSwap(userKeypair, creator, topicId, amountIn, is_yes_to_usdb).then(() => {
  console.log("Yes swap completed successfully");
}).catch((error) => {
  console.error("Error performing yes swap:", error);
}); 