import { program, oracleKeypair, SystemProgram, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';


// oracle: 8hcNpLUvugMLHzvKSxqGZ1bvMbFzQ4qV4uurmdHS9ScX

async function initializeOracle(oracleKeypair: Keypair): Promise<void> {
  const [oracle] = PublicKey.findProgramAddressSync(
    [Buffer.from("oracle")],
    program.programId,
  );

  console.log("oracle:",oracle.toString());

  const transaction = await program.methods
    .initializeOracle()
    .accounts({
      admin: oracleKeypair.publicKey,
      // oracle: oracle,
      // systemProgram: SystemProgram.programId,
    })
    .signers([oracleKeypair])
    .rpc();
  
  console.log("Oracle initialized with transaction:", transaction);
}

initializeOracle(oracleKeypair).then(() => {
  console.log("Oracle initialization completed");
}).catch((error) => {
  console.error("Error initializing oracle:", error);
}); 