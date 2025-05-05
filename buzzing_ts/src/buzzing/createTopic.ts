import { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

async function createTopic(userKeypair: Keypair, topicIpfsHash: number[]): Promise<void> {
  const [market] = PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    program.programId,
  );

  const [vault] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [liquidity] = PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  const marketAccount = await program.account.market.fetch(market);
  const nextIdBuf = Buffer.alloc(8);
  nextIdBuf.writeBigUInt64LE(BigInt(marketAccount.nextId));

  const [topic] = PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), nextIdBuf, userKeypair.publicKey.toBuffer()],
    program.programId,
  );

  const [yesPool] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topic.toBuffer()],
    program.programId,
  );

  console.log("yesPool: ",yesPool.toString());

  const [noPool] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topic.toBuffer()],
    program.programId,
  );

  console.log("noPool: ",noPool.toString());

  const [yesMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topic.toBuffer()],
    program.programId,
  );

  console.log("yes_mint: ", yesMint.toString());

  const [noMint] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topic.toBuffer()],
    program.programId,
  );

  console.log("noMint: ", noMint.toString());

  const [yesPoolUsdb] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topic.toBuffer()],
    program.programId,
  );

  console.log("noMint: ", noMint.toString());

  const [yesPoolToken] = PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topic.toBuffer()],
    program.programId,
  );

  console.log("yesPoolToken: ", yesPoolToken.toString());

  const [noPoolUsdb] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topic.toBuffer()],
    program.programId,
  );

  console.log("noPoolUsdb: ", noPoolUsdb.toString());

  const [noPoolToken] = PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topic.toBuffer()],
    program.programId,
  );

  console.log("noPoolToken: ", noPoolToken.toString());

  const transaction = await program.methods
    .createTopic(topicIpfsHash)
    .accounts({
      creator: userKeypair.publicKey,
      // market: market,
      // vault: vault,
      // vaultUsdb: liquidity,
      topic: topic,
      // yesMint: yesMint,
      // noMint: noMint,
      // yesPool: yesPool,
      // noPool: noPool,
      // yesPoolUsdb: yesPoolUsdb,
      // yesPoolToken: yesPoolToken,
      // noPoolUsdb: noPoolUsdb,
      // noPoolToken: noPoolToken,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Topic created with transaction:", transaction);
}

// Example IPFS hash for topic content
const ipfsHash = "QmW8FLpXp5zEzDDuGKrWysyHkVp8HTdLxH1xsuJCRZQfPz";

// Convert IPFS hash to 32-byte array
const encoder = new TextEncoder();
const topic_ipfs_hash = Array.from(encoder.encode(ipfsHash)).slice(0, 32);

const userKeypair = userKeypair1;

// createTopic(userKeypair, topic_ipfs_hash).then(() => {
//   console.log("Topic creation completed with IPFS hash:", ipfsHash);
// }).catch((error) => {
//   console.error("Error creating topic:", error);
// }); 


// yesPool:  EkJMn7J8nRSLGF6gfVw8tZE2ErAievu1xaGzBK8kgAmL
// noPool:  7eBpSxfqhv2QF2M4QrWC6QiUjWjBPkP9zkVgz6n26DHK
// yes_mint:  73a7GYEBagBvnychE5qkip7bTGcETAxLY5bsFdUZA23z
// noMint:  A1pgiS9nHffrY8gcwaGBEuXBm5fNH7JBb2r1HwgPpK5Z
// noMint:  A1pgiS9nHffrY8gcwaGBEuXBm5fNH7JBb2r1HwgPpK5Z
// yesPoolToken:  Eebi39a1eTTR5CrQLvLq4vHzb3J7btJ1fA8wJMn9XAab
// noPoolUsdb:  5J2mnQHM5NMCacGeGwFFERy59Pxj4QZ3bEjkbbay4R98
// noPoolToken:  FdSsqtFp9wkkoiHW1bH395tX6hK2EoyZxApC2LN3bfdG
// Topic created with transaction: dncHzVH5Q7AjA67tkog1Ux3emMUHJ77vJfWrqaHMfzmKrsVagEXogsdCrAkDeTdszTQTUZ4PrPH7Q6wMJkAWNyn

import { getTopic,getMarket } from './utils';

getTopic(userKeypair.publicKey, 3)
// getMarket()


// topicId: 5
// creator: 26jDa3KV9Pcyn6QenpehgzXzVEjwuZdSA34hycP2HmnC
// yesMint: 73a7GYEBagBvnychE5qkip7bTGcETAxLY5bsFdUZA23z
// noMint: A1pgiS9nHffrY8gcwaGBEuXBm5fNH7JBb2r1HwgPpK5Z
// yesPool: EkJMn7J8nRSLGF6gfVw8tZE2ErAievu1xaGzBK8kgAmL
// noPool: 7eBpSxfqhv2QF2M4QrWC6QiUjWjBPkP9zkVgz6n26DHK
// totalToken: 0.999999
// initialPrice: 500000
// isEnded: false
// winningToken: null
// topicIpfsHash: 81,109,87,56,70,76,112,88,112,53,122,69,122,68,68,117,71,75,114,87,121,115,121,72,107,86,112,56,72,84,100,76
