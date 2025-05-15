const { userKeypair1, program, usdb_mint, TOKEN_PROGRAM_ID, PublicKey, getAssociatedTokenAddress } = require('./config');

async function withdraw(userKeypair, strategyId, amount) {
  const [vault] = await PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId,
  );

  const [receipt] = await PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), Buffer.from([strategyId]), userKeypair.publicKey.toBuffer()],
    program.programId,
  );

  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
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

// module.exports = withdraw; 


const strategyId = 1;
const usdb_amount = 6000*1e6;
const userKeypair = userKeypair1;

withdraw(userKeypair, strategyId, usdb_amount).then(() => {
  console.log("Deposit completed successfully");
}).catch((error) => {
  console.error("Error depositing:", error);
});