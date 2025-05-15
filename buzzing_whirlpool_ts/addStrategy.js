const { program, walletKeypair, SystemProgram, PublicKey, walletKeypair } = require('./config');

async function addStrategy(walletKeypair,usedPrincipalPercent, apr) {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  const strategyState = Keypair.generate();

  const transaction = await program.methods
    .addStrategy(usedPrincipalPercent, apr)
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

// module.exports = addStrategy; 

const usedPrincipalPercent1 = 0;
const apr1 = 300 // 3%

const usedPrincipalPercent2 = 20;  // 20%
const apr2 = 500  // 5%

const walletKeypairx = walletKeypair;


addStrategy(walletKeypairx, sedPrincipalPercent1, apr1).then(() => {
  console.log("Strategy 1 added successfully");
}).catch((error) => {
  console.error("Error adding strategy 1:", error);
});

// addStrategy(walletKeypairx, usedPrincipalPercent2, apr2).then(() => {
//   console.log("Strategy 2 added successfully"); 
// }).catch((error) => {
//   console.error("Error adding strategy 2:", error);
// });

