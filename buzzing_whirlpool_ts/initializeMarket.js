const { program, walletKeypair, usdc_mint, usdb_mint, TOKEN_PROGRAM_ID, SystemProgram, PublicKey } = require('./config');

async function initializeMarket(walletKeypair, usdcMint,usdbMint) {
  const [market] = await PublicKey.findProgramAddressSync(
    [Buffer.from("market")],
    program.programId,
  );

  console.log("market==>",market.toString());



  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  console.log("vault==>",vault.toString());


  const [swap] = await PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    program.programId,
  );

  console.log("usdcSwap==>",swap.toString());

  const [liquidity] = await PublicKey.findProgramAddressSync(
    [Buffer.from("liquidity")],
    program.programId,
  );

  console.log("usdbLiquidity==>",liquidity.toString());


  const [fee] = await PublicKey.findProgramAddressSync(
    [Buffer.from("fee")],
    program.programId,
  );

  console.log("usdbFee==>",fee.toString());

  const [usdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    program.programId,
  );

  console.log("usdbSwap==>",usdb.toString());


  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  console.log("globalStrategyRegistry: registry,==>",registry.toString());


  const transaction = await program.methods
    .initializeMarket()
    .accounts({
      admin: walletKeypair.publicKey,
      market: market,
      vault: vault,
      usdcSwap: swap,
      usdbLiquidity: liquidity,
      usdbFee: fee,
      usdbSwap: usdb,
      globalStrategyRegistry: registry,
      usdcMint: usdcMint,
      usdbMint: usdbMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Market initialized with transaction:", transaction);
}

// module.exports = initializeMarket; 




initializeMarket(walletKeypair, usdc_mint, usdb_mint).then(() => {
  console.log("Market initialization completed");
}).catch((error) => {
  console.error("Error initializing market:", error);
});