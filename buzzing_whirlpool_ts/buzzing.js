const anchor = require('@project-serum/anchor');
const fs = require('fs');
const crypto = require("crypto");
// const splToken = require('@project-serum/spl-token');
const { SystemProgram, Keypair, PublicKey, TokenProgram } = anchor.web3;
const TOKEN_PROGRAM_ID = anchor.utils.token.TOKEN_PROGRAM_ID;
const ASSOCIATED_PROGRAM_ID = anchor.utils.token.ASSOCIATED_PROGRAM_ID;
const { getAssociatedTokenAddress, getAssociatedTokenAddressSync } = require('@solana/spl-token');
const base58 = require('bs58');



const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);



const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/id.json', 'utf8')));
const walletKeypair = Keypair.fromSecretKey(secretKey);
// Pubkey: FtPHbPzNtQC3jXK7py2hQT3g5EDknVtQygdguv6sNkwx
console.log("Wallet pubkey:", walletKeypair.publicKey.toString());

// 创建provider
const wallet = new anchor.Wallet(walletKeypair);

// const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=d64ad269-f73b-4885-88d1-359e1faf2ae3", "confirmed");
// const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
// const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
// anchor.setProvider(provider);

// // 初始化合约对象
// const idl = require('./buzzing.json');
// const programId = new PublicKey("6EHVHbMGzHAhcfKqn3YmRmRGzCix2S2kFEa63Tx79JhG");
// const program = new anchor.Program(idl, programId, provider);


// const usdc_mint = new PublicKey("");
// const usdb_mint = new PublicKey("");



// Market functions
async function initializeMarket(walletKeypair) {
  const [market] = await PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [swap] = await PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    programId,
  );

  const [liquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );

  const [fee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    programId,
  );

  const [usdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    programId,
  );

  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );


  const transaction = await program.methods
    .initializeMarket()
    .accounts({
      admin: walletKeypair.publicKey,
      market:market,
      vault: vault,
      swap: swap,
      liquidity: liquidity,
      fee: fee,
      usdb: usdb,
      registry: registry,
      usdcMint: usdc_mint,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([walletKeypair])
    .rpc();
  
    console.log("Market initialized with transaction:",transaction);
}

async function initializeOracle(oracleKeypair) {
  const [oracle] = await PublicKey.findProgramAddressSync(
    [Buffer.from("oracle")],
    programId,
  );

  const transaction = await program.methods
    .initializeOracle()
    .accounts({
      admin: oracleKeypair.publicKey,
      oracle: oracle,
      systemProgram: SystemProgram.programId,
    })
    .signers([oracleKeypair])
    .rpc();
  
  console.log("Oracle initialized with transaction:", transaction);
}

// Topic functions
async function createTopic(userKeypair,topicIpfsHash) {
  const [market] = await PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [liquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );


  const [topic] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(market.next_id.toArray('le', 5)), userKeypair.publicKey.toBuffer()],
    programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topic.toBuffer()],
    programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topic.toBuffer()],
    programId,
  );

  const [yesMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topic.toBuffer()],
    programId,
  );

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topic.toBuffer()],
    programId,
  );

  const [yesPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topic.toBuffer()],
    programId,
  );
  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topic.toBuffer()],
    programId,
  );
  const [noPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topic.toBuffer()],
    programId,
  );


  const transaction = await program.methods
    .createTopic(topicIpfsHash)
    .accounts({
      creator: userKeypair.publicKey,
      market: market,
      vault: vault,
      vaultUsdb:liquidity,
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

async function endTopic(oracleKeypair, topicCreator, winningToken, topicId) {
  const [oracle] = await PublicKey.findProgramAddressSync(
    [Buffer.from("oracle")],
    programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [vaultUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );

  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topicPda.toBuffer()],
    programId,
  );

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    programId,
  );

  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topicPda.toBuffer()],
    programId,
  );

  const [yesPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const [noPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const transaction = await program.methods
    .endTopic(winningToken, new anchor.BN(topicId))
    .accounts({
      oracleAdmin: oracleKeypair.publicKey,
      oracle: oracle,
      vault: vault,
      vaultUsdb: vaultUsdb,
      topic: topicPda,
      yesPool: yesPool,
      noPool: noPool,
      yesPoolUsdb: yesPoolUsdb,
      noPoolUsdb: noPoolUsdb,
      yesPoolToken: yesPoolToken,
      noPoolToken: noPoolToken,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([oracleKeypair])
    .rpc();
  
  console.log("Topic ended with transaction:", transaction);
}

// Swap functions
async function swapUsdcUsdb(userKeypair, amount, isUsdcToUsdb) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [vaultUsdcSwap] = await PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    programId,
  );

  const [vaultUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    programId,
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
      vault: vault,
      vaultUsdcSwap: vaultUsdcSwap,
      vaultUsdb: vaultUsdb,
      userUsdc: userUsdcTokenAccount,
      userUsdb: userUsdbTokenAccount,
      usdbMint: usdb_mint,
      usdcMint: usdc_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("USDC/USDB swap completed with transaction:", transaction);
}

async function yesSwap(userKeypair, topicCreator, topicId, amountIn, isNoToUsdb) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    programId,
  );

  const userYesTokenAccount = await getAssociatedTokenAddress(
    yesMint,
    userKeypair.publicKey
  );

  const [poolYesTokenAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [poolUsdbAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topicPda.toBuffer()],
    programId,
  );

  const [usdbFee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    programId,
  );

  const [yesTokenMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    programId,
  );

  const transaction = await program.methods
    .yesSwap(new anchor.BN(amountIn), isNoToUsdb)
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

async function noSwap(userKeypair, topicCreator, topicId, amountIn, isNoToUsdb) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    programId,
  );

  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topicPda.toBuffer()],
    programId,
  );

  const userNoTokenAccount = await getAssociatedTokenAddress(
    noMint,
    userKeypair.publicKey
  );

  const [poolNoTokenAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [poolUsdbAccount] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topicPda.toBuffer()],
    programId,
  );

  const [usdbFee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    programId,
  );

  const [noTokenMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topicPda.toBuffer()],
    programId,
  );

  const transaction = await program.methods
    .noSwap(new anchor.BN(amountIn), isNoToUsdb)
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

// Strategy functions
async function addStrategy(walletKeypair, usedPrincipalPercent, apy) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );

  const strategyState = Keypair.generate();

  const transaction = await program.methods
    .addStrategy(usedPrincipalPercent, apy)
    .accounts({
      registry: registry,
      strategyState: strategyState.publicKey,
      admin: walletKeypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([walletKeypair, strategyState])
    .rpc();
  
  console.log("Strategy added with transaction:", transaction);
}

async function toggleStrategy(walletKeypair, active) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );

  const transaction = await program.methods
    .toggleStrategy(active)
    .accounts({
      registry: registry,
      strategyState: strategyState.publicKey,
      admin: walletKeypair.publicKey,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Strategy toggled with transaction:", transaction);
}

async function updateStrategyApr(walletKeypair, newApy) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );

  const transaction = await program.methods
    .updateStrategyApr(newApy)
    .accounts({
      registry: registry,
      strategyState: strategyState.publicKey,
      admin: walletKeypair.publicKey,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Strategy APR updated with transaction:", transaction);
}

// Deposit and Withdraw functions
async function deposit(userKeypair, strategyId, amount) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [receipt] = await PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), Buffer.from([strategyId]), userKeypair.publicKey.toBuffer()],
    programId,
  );

  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [vaultUsdbLiquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );

  const transaction = await program.methods
    .deposit(strategyId, new anchor.BN(amount))
    .accounts({
      user: userKeypair.publicKey,
      vault: vault,
      receipt: receipt,
      registry: registry,
      userUsdb: userUsdbTokenAccount,
      vaultUsdbLiquidity: vaultUsdbLiquidity,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Deposit completed with transaction:", transaction);
}

async function withdraw(userKeypair, strategyId, amount) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );

  const [receipt] = await PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), Buffer.from([strategyId]), userKeypair.publicKey.toBuffer()],
    programId,
  );

  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [vaultUsdbLiquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );

  const transaction = await program.methods
    .withdraw(strategyId, new anchor.BN(amount))
    .accounts({
      user: userKeypair.publicKey,
      vault: vault,
      receipt: receipt,
      registry: registry,
      userUsdb: userUsdbTokenAccount,
      vaultUsdbLiquidity: vaultUsdbLiquidity,
      usdbMint: usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Withdrawal completed with transaction:", transaction);
}

async function closePools(creatorKeypair, topicId) {
  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), creatorKeypair.publicKey.toBuffer()],
    programId,
  );

  const [yesPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool"), topicPda.toBuffer()],
    programId,
  );

  const [noPool] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool"), topicPda.toBuffer()],
    programId,
  );

  const [yesMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    programId,
  );

  const [noMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topicPda.toBuffer()],
    programId,
  );

  const [yesPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const [noPoolToken] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_token"), topicPda.toBuffer()],
    programId,
  );

  const [yesPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_pool_usdb"), topic.toBuffer()],
    programId,
  );

  const [noPoolUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_pool_usdb"), topic.toBuffer()],
    programId,
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
      yesToken: yesPoolToken,
      noToken: noPoolToken,
      yesUsdb: yesPoolUsdb,
      noUsdb: yesPoolUsdb,
      usdbMint:usdb_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([creatorKeypair])
    .rpc();
  
  console.log("Pools closed with transaction:", transaction);
}

async function redeem(userKeypair, topicCreator, topicId, amount) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId,
  );


  const [topicPda] = await PublicKey.findProgramAddressSync(
    [Buffer.from("topic"), Buffer.from(new anchor.BN(topicId).toArray('le', 5)), topicCreator.toBuffer()],
    programId,
  );

  const userUsdbTokenAccount = await getAssociatedTokenAddress(
    usdb_mint,
    userKeypair.publicKey
  );

  const [vaultUsdbLiquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    programId,
  );

  const [yesMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("yes_mint"), topicPda.toBuffer()],
    programId,
  );

  const [noMint] = await PublicKey.findProgramAddressSync(
    [Buffer.from("no_mint"), topicPda.toBuffer()],
    programId,
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
    .redeem(new anchor.BN(amount))
    .accounts({
      user: userKeypair.publicKey,
      vault: vault,
      topic: topicPda,
      userUsdb: userUsdbTokenAccount,
      vaultUsdbLiquidity:vaultUsdbLiquidity,
      yesToken:yesToken,
      noToken:noToken,
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







const oracleSecreKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair.json', 'utf8')));
const oracleKeypair =  Keypair.fromSecretKey(oracleSecreKey);
// 35bWNQi2HrG7iZuWjU9NxexdR3yamhimjDkhxQQUQkgK
console.log("user1==>",oracleKeypair.publicKey.toString());



// 3个用户
const secretKey1 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair1.json', 'utf8')));
const userKeypair1 = Keypair.fromSecretKey(secretKey1);
// pubkey: 26jDa3KV9Pcyn6QenpehgzXzVEjwuZdSA34hycP2HmnC
// console.log("user1==>",userKeypair1.publicKey.toString());

const secretKey2 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair2.json', 'utf8')));
const userKeypair2 = Keypair.fromSecretKey(secretKey2);
// pubkey: X3XeRdP1wLJ6CsPW3bpotRNLd6pt6cWmMKK6nA99vWm
// console.log("user2==>",userKeypair2.publicKey.toString());


const secretKey3 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair3.json', 'utf8')));
const userKeypair3 = Keypair.fromSecretKey(secretKey3);
// pubkey: 8GgHNWyBT7bsyKctkKaMAtG6z1N2ZAD4UKq6YtvbUAxQ
// console.log("user3==>",userKeypair3.publicKey.toString());














