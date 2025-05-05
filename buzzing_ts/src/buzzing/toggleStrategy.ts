import { program, walletKeypair, PublicKey, anchor } from './config';
import { Keypair } from '@solana/web3.js';

async function toggleStrategy(topicId: number, active: boolean): Promise<void> {
  const [registry] = await PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  const transaction = await program.methods
    .toggleStrategy(new anchor.BN(topicId),active)
    .accounts({
      registry: registry,
      // strategyState: strategyState.publicKey, 
      admin: walletKeypair.publicKey,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Strategy toggled with transaction:", transaction);
}

// export default toggleStrategy; 

toggleStrategy(3,false).then(()=>{
  console.log("toggleStrategy success");
}).then(()=>{
  console.log("toggleStrategy success");
})

// StrategyState:
// strategyId: 3
// used_principal_percent: 50
// APR: 1000
// total_principal: 300
// total_interest: 0.06383
// total_user: 3
// used_principal_percent: 50
// active: true
// last_update_ts: 2025/5/2 12:32:10