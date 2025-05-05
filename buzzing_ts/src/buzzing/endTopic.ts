import { oracleKeypair, userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

async function endTopic(
  oracleKeypair: Keypair,
  topicCreator: PublicKey,
  winningToken: PublicKey,
  topicId: number
): Promise<void> {
  const [oracle] = await PublicKey.findProgramAddressSync(
    [Buffer.from("oracle")],
    program.programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [vaultUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
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

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    program.programId,
  );

  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topicPda.toBuffer()],
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

  const transaction = await program.methods
    .endTopic(topicCreator,new anchor.BN(topicId), winningToken)
    .accounts({
      oracleAdmin: oracleKeypair.publicKey,
      // oracle: oracle,
      // vault: vault,
      // vaultUsdb: vaultUsdb,
//       topic: topicPda,
      // yesPool: yesPool,
      // noPool: noPool,
      // yesPoolUsdb: yesPoolUsdb,
      // noPoolUsdb: noPoolUsdb,
      // yesPoolToken: yesPoolToken,
      // noPoolToken: noPoolToken,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([oracleKeypair])
    .rpc();
  
  console.log("Topic ended with transaction:", transaction);
}

const oracleKeypairx = oracleKeypair;
const topicCreator = userKeypair1.publicKey;
const winningToken = new PublicKey('24WG5MyVfQSyPopnVJJdw1mmUUHbM3DH5JvJNSi4MwZh');
const topicId = 2;

endTopic(oracleKeypairx, topicCreator, winningToken, topicId)
  .then(() => {
    console.log("Successfully ended topic");
  })
  .catch((error) => {
    console.error("Error ending topic:", error);
  }); 