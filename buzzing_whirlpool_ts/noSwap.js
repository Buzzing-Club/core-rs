const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, ASSOCIATED_PROGRAM_ID, SystemProgram, PublicKey, getAssociatedTokenAddress } = require('./config');

async function noSwap(userKeypair, topicCreator, topicId, amountIn, is_no_to_usdb) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    program.programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topicPda.toBuffer()],
    program.programId,
  );

  const userNoTokenAccount = await getAssociatedTokenAddress(
    noMint,
    userKeypair.publicKey
  );

  const [poolNoTokenAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topicPda.toBuffer()],
    program.programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [poolUsdbAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const [usdbFee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    program.programId,
  );

  const [noTokenMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const transaction = await program.methods
    .noSwap(new anchor.BN(amountIn), is_no_to_usdb)
    .accounts({
      user: userKeypair.publicKey,
      topic: topicPda,
      vault: vault,
      noPool: noPool,
      userNoAccount: userNoTokenAccount,
      poolNoAccount: poolNoTokenAccount,
      userUsdbAccount: userUsdbTokenAccount,
      poolUsdbAccount: poolUsdbAccount,
      usdbFee: usdbFee,
      noTokenMint: noTokenMint,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("No swap completed with transaction:", transaction);
}

// module.exports = noSwap; 


const userKeypair = userKeypair1;
const topicId = 1;
const creator = userKeypair.publicKey;
const amountIn = 15*1e6;
const is_no_to_usdb = true;


noSwap(userKeypair,creator,topicId,amountIn,is_no_to_usdb).then(() => {
  console.log("Yes swap completed successfully");
}).catch((error) => {
  console.error("Error performing yes swap:", error);
});