import { userKeypair1, userKeypair2,program, usdb_mint, TOKEN_PROGRAM_ID, anchor, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';


async function closePools(creatorKeypair: Keypair, topicId: number) {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(BigInt(topicId));


  const [topicPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), idBuf, creatorKeypair.publicKey.toBuffer()],
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
    .closePools(creatorKeypair.publicKey,new anchor.BN(topicId))
    .accounts({
      // creator: creatorKeypair.publicKey,
      // topic: topicPda,
      // yesPool: yesPool,
      // noPool: noPool,
      // yesMint: yesMint,
      // noMint: noMint,
      // yesPoolToken: yesPoolToken,
      // noPoolToken: noPoolToken,
      // yesPoolUsdb: yesPoolUsdb,
      // yesPoolUsdb: noPoolUsdb,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  
  console.log("Pools closed with transaction:", transaction);
}

async function closePoolsV2(creator: PublicKey, topicId: number) {
  const idBuf = Buffer.alloc(8);
  idBuf.writeBigUInt64LE(BigInt(topicId));


  const [topicPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), idBuf, creator.toBuffer()],
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
    .closePoolsV2(new anchor.BN(topicId))
    .accounts({
      // signer: userKeypair1.publicKey,
      creator: creator,
      // topic: topicPda,
      // yesPool: yesPool,
      // noPool: noPool,
      // yesMint: yesMint,
      // noMint: noMint,
      // yesPoolToken: yesPoolToken,
      // noPoolToken: noPoolToken,
      // yesPoolUsdb: yesPoolUsdb,
      // yesPoolUsdb: noPoolUsdb,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID
      // systemProgram: SystemProgram.programId,
    })
    .signers([])
    .rpc();
  
  console.log("Pools closed with transaction:", transaction);
}



const userKeypair = userKeypair1;

// closePoolsV2(userKeypair.publicKey, 4).then(()=>{
//     console.log("closePool success");
// }).then(()=>{
//     console.log("closePool success");
// })

closePools(userKeypair, 3).then(()=>{
  console.log("closePool success");
}).then(()=>{
  console.log("closePool success");
})