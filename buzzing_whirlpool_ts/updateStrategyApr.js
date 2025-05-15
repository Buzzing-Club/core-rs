const { program, walletKeypair, PublicKey } = require('./config');

async function updateStrategyApr(newApy) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
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

module.exports = updateStrategyApr; 