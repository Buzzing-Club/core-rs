import { program, walletKeypair, SystemProgram, PublicKey } from './config';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

async function addStrategy(
  walletKeypair: Keypair,
  usedPrincipalPercent: number,
  apr: number
): Promise<void> {
  const [registry] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );


  const registryAccount = await program.account.globalStrategyRegistry.fetch(registry);
  // const strategySeed = Buffer.alloc(1);
  // strategySeed.writeUInt8(registryAccount.strategyIds.length+1);

  const strategySeed = Buffer.from([registryAccount.strategyIds.length+1]); // u8 用一个字节表示
  const [strategyState] = PublicKey.findProgramAddressSync(
    [Buffer.from("strategy"),strategySeed],
    program.programId,
  );

  console.log("strategyState: ",strategyState.toString());

  
  const transaction = await program.methods
    .addStrategy(usedPrincipalPercent, apr)
    .accounts({
      // registry: registry,
      strategyState: strategyState,
      // admin: walletKeypair.publicKey,
      // systemProgram: SystemProgram.programId,
    })
    .signers([walletKeypair])
    .rpc();
  
  console.log("Strategy added with transaction:", transaction);
}


async function update_global_strategy_registry(
  walletKeypair: Keypair,
  ids: number[],
): Promise<void> {
  const [registry] = PublicKey.findProgramAddressSync(
    [Buffer.from("registry")],
    program.programId,
  );

  const transaction = await program.methods
    .updateGlobalStrategyRegistry(Buffer.from(ids))
    .accounts({
      admin: walletKeypair.publicKey,
      globalStrategyRegistry: registry,
    })
    .signers([walletKeypair])
    .rpc();
  
  
  console.log("Strategy updated with transaction:", transaction);
}


const usedPrincipalPercent1 = 10;
const apr1 = 400; // 3%
// strategy1: CVeeafokD2hhB1N7cQzJPzZKjzbc2nzLrucV7sDebZxA

const usedPrincipalPercent2 = 20;  // 20%
const apr2 = 500;  // 5%

// strategy2: 66rLHwWUkoNfWsUpJiewgBgFDwRPBSwpECuicRYJKSv8


const usedPrincipalPercent3 = 30;  // 50%
const apr3 = 1200;  // 10%
// strategy3: BTeodfri5vUmYY9jb6bxQYXtuv4LzcZ7PAieAaTZ2y52


const walletKeypairx = walletKeypair;
const ids = [3,4,5,6,7];

// update_global_strategy_registry(walletKeypairx, ids).then(() => {
//   console.log("Strategy updated successfully");
// }).then(() => {
//   console.log("Strategy updated successfully");
// })


// addStrategy(walletKeypairx, usedPrincipalPercent1, apr1).then(() => {
//   console.log("Strategy 1 added successfully");
// }).catch((error) => {
//   console.error("Error adding strategy 1:", error);
// });

// addStrategy(walletKeypairx, usedPrincipalPercent3, apr3).then(() => {
//   console.log("Strategy 2 added successfully"); 
// }).catch((error) => {
//   console.error("Error adding strategy 2:", error);
// }); 

import { getStrategyState } from './utils';

getStrategyState(3)

// getStrategyState(2)

// 5: 7yacZw7rc6py5PPKhQmApnbN36qCGEfMJBGEZ8t9uZdf
// 6: AuV1vxQF5oXAgZiNJWDaKegQG9BFGMak694fu6ZryDmu
// 7: ME9B1Vz6SRbFFupCimjuFztGGzCinXcS16U3Jrz9gYK