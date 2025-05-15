const { program, walletKeypair, PublicKey } = require('./config');

async function toggleStrategy(active) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
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

module.exports = toggleStrategy; 