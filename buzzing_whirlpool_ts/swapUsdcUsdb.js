const { userKeypair1, program, usdc_mint, usdb_mint, TOKEN_PROGRAM_ID, ASSOCIATED_PROGRAM_ID, SystemProgram, PublicKey, getAssociatedTokenAddress } = require('./config');

async function swapUsdcUsdb(userKeypair, amount, isUsdcToUsdb) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [vaultUsdc] = await PublicKey.findProgramAddressSync(
    [Buffer.from("swap")],
    program.programId,
  );

  const [vaultUsdb] = await PublicKey.findProgramAddressSync(
    [Buffer.from("usdb")],
    program.programId,
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
      vaultUsdc: vaultUsdc,
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

// module.exports = swapUsdcUsdb; 




const userKeypair = userKeypair1;
const amount = 1500*1e6;
const isUsdcToUsdb = true;

swapUsdcUsdb(userKeypair,amount,isUsdcToUsdb).then(() => {
  console.log("USDC/USDB swap completed successfully");
}).catch((error) => {
  console.error("Error performing USDC/USDB swap:", error);
});


// const userKeypair = userKeypair1;
// const amount = 200*1e6;
// const isUsdcToUsdb = false;

// swapUsdcUsdb(userKeypair,amount,isUsdcToUsdb).then(() => {
//   console.log("USDC/USDB swap completed successfully");
// }).catch((error) => {
//   console.error("Error performing USDC/USDB swap:", error);
// });