const { program, oracleKeypair, SystemProgram, PublicKey } = require('./config');

async function initializeOracle(oracleKeypair) {
  const [oracle] = await PublicKey.findProgramAddressSync(
    [Buffer.from("oracle")],
    program.programId,
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

// module.exports = initializeOracle; 

initializeOracle(oracleKeypair).then(() => {
  console.log("Oracle initialization completed");
}).catch((error) => {
  console.error("Error initializing oracle:", error);
});