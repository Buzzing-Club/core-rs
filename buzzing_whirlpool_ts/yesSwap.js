const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, ASSOCIATED_PROGRAM_ID, SystemProgram, PublicKey, getAssociatedTokenAddress } = require('./config');

async function yesSwap(userKeypair, topicCreator, topicId, amountIn, is_yes_to_usdb) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    program.programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    program.programId,
  );

  const userYesTokenAccount = await getAssociatedTokenAddress(
    yesMint,
    userKeypair.publicKey
  );

  const [poolYesTokenAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    program.programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [poolUsdbAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const [usdbFee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    program.programId,
  );

  const [yesTokenMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const transaction = await program.methods
    .yesSwap(new anchor.BN(amountIn), is_yes_to_usdb)
    .accounts({
      user: userKeypair.publicKey,
      topic: topicPda,
      vault: vault,
      yesPool: yesPool,
      userYesAccount: userYesTokenAccount,
      poolYesAccount: poolYesTokenAccount,
      userUsdbAccount: userUsdbTokenAccount,
      poolUsdbAccount: poolUsdbAccount,
      usdbFee: usdbFee,
      yesTokenMint: yesTokenMint,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Yes swap completed with transaction:", transaction);
}

// module.exports = yesSwap; 




const userKeypair = userKeypair1;
const topicId = 1;
const creator = userKeypair.publicKey;
const amountIn = 10*1e6;
const is_yes_to_usdb = true;


yesSwap(userKeypair,creator,topicId,amountIn,is_yes_to_usdb).then(() => {
  console.log("Yes swap completed successfully");
}).catch((error) => {
  console.error("Error performing yes swap:", error);
});

