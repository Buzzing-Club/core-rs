import { program, walletKeypair, PublicKey,anchor } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

async function updateStrategyApr(topicId:number, newApy: number): Promise<void> {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  const transaction = await program.methods
    .updateStrategyApr(new anchor.BN(topicId),newApy)
    .accounts({
      registry: registry,
      // strategyState: strategyState.publicKey,
      admin: walletKeypair.publicKey,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Strategy APR updated with transaction:", transaction);
}

// export default updateStrategyApr; 

updateStrategyApr(3,555).then(()=>{
  console.log("updateStrategyApr success");
}).then(()=>{
  console.log("updateStrategyApr success");
})