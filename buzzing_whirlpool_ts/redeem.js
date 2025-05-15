const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, ASSOCIATED_PROGRAM_ID, PublicKey, getAssociatedTokenAddress } = require('./config');

async function redeem(userKeypair, topicCreator, topicId) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    program.programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [vaultUsdbLiquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  const [yesMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const [noMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topicPda.toBuffer()],
    program.programId,
  );

  const yesToken = await getAssociatedTokenAddress(
    yesMint,
    userKeypair.publicKey
  );

  const noToken = await getAssociatedTokenAddress(
    noMint,
    userKeypair.publicKey
  );

  const transaction = await program.methods
    .redeem()
    .accounts({
      user: userKeypair.publicKey,
      vault: vault,
      topic: topicPda,
      userUsdb: userUsdbTokenAccount,
      vaultUsdbLiquidity: vaultUsdbLiquidity,
      yesToken: yesToken,
      noToken: noToken,
      yesMint: yesMint,
      noMint: noMint,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Tokens redeemed with transaction:", transaction);
}

// module.exports = redeem; 





const userKeypair = userKeypair1;
const topicCreator = userKeypair.publicKey;
const topicId = 1;


redeem(userKeypair1,topicCreator,topicId).then(() => {
  console.log("Successfully redeemed tokens");
}).catch((error) => {
  console.error("Error redeeming tokens:", error);
});