const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } = require('./config');

async function closePools(creatorKeypair, topicId) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), creatorKeypair.publicKey.toBuffer()],
    program.programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    program.programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topicPda.toBuffer()],
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

  const [yesPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    program.programId,
  );

  const [noPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topicPda.toBuffer()],
    program.programId,
  );

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const transaction = await program.methods
    .closePools()
    .accounts({
      creator: creatorKeypair.publicKey,
      topic: topicPda,
      yesPool: yesPool,
      noPool: noPool,
      yesMint: yesMint,
      noMint: noMint,
      yesPoolToken: yesPoolToken,
      noPoolToken: noPoolToken,
      yesPoolUsdb: yesPoolUsdb,
      yesPoolUsdb: noPoolUsdb,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([creatorKeypair])
    .rpc();
  
  console.log("Pools closed with transaction:", transaction);
}

// module.exports = closePools; 




const creatorKeypair = userKeypair1;
const topicId = 1;


closePools(creatorKeypair,topicId).then(() => {
  console.log("Pools closed successfully");
}).catch((error) => {
  console.error("Error closing pools:", error);
});