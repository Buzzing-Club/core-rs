const { SystemProgram } = require('@solana/web3.js');
const { userKeypair1,program, usdb_mint, TOKEN_PROGRAM_ID, PublicKey, getAssociatedTokenAddress, ASSOCIATED_PROGRAM_ID } = require('./config');

async function deposit(userKeypair, strategyId, amount) {
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
      associatedTokenAddress: ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([userKeypair])
    .rpc();
  
  console.log("Deposit completed with transaction:", transaction);
}

// module.exports = deposit; 



const strategyId = 1;
const usdb_amount = 1000*1e6;
const userKeypair = userKeypair1;

deposit(userKeypair, strategyId, usdb_amount).then(() => {
  console.log("Deposit completed successfully");
}).catch((error) => {
  console.error("Error depositing:", error);
});