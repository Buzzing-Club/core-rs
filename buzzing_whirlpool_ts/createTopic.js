const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } = require('./config');

async function createTopic(userKeypair, topicIpfsHash) {
  const [market] = await PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    program.programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [liquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  const [topic] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(market.next_id.toArray('le', 5)), userKeypair.publicKey.toBuffer()],
    program.programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topic.toBuffer()],
    program.programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topic.toBuffer()],
    program.programId,
  );

  const [yesMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topic.toBuffer()],
    program.programId,
  );

  console.log("yes_mint==>",yesMint.toString())

  const [noMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topic.toBuffer()],
    program.programId,
  );

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topic.toBuffer()],
    program.programId,
  );

  const [yesPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topic.toBuffer()],
    program.programId,
  );

  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topic.toBuffer()],
    program.programId,
  );

  const [noPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topic.toBuffer()],
    program.programId,
  );

  const transaction = await program.methods
    .createTopic(topicIpfsHash)
    .accounts({
      creator: userKeypair.publicKey,
      market: market,
      vault: vault,
      vaultUsdb: liquidity,
      topic: topic,
      yesMint: yesMint,
      noMint: noMint,
      yesPool: yesPool,
      noPool: noPool,
      yesPoolUsdb: yesPoolUsdb,
      yesPoolToken: yesPoolToken,
      noPoolUsdb: noPoolUsdb,
      noPoolToken: noPoolToken,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Topic created with transaction:", transaction);
}

// module.exports = createTopic; 


// Example IPFS hash for topic content
const ipfsHash = "QmW8FLpXp5zEzDDuGKrWysyHkVp8HTdLxH1xsuJCRZQfPx";

// Convert IPFS hash to 32-byte array
const encoder = new TextEncoder();
const topic_ipfs_hash = Array.from(encoder.encode(ipfsHash)).slice(0, 32);

createTopic(userKeypair1, topic_ipfs_hash).then(() => {
  console.log("Topic creation completed with IPFS hash:", ipfsHash);
}).catch((error) => {
  console.error("Error creating topic:", error);
});