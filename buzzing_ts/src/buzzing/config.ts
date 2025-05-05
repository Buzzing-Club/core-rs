import * as anchor from '@coral-xyz/anchor';
import fs from 'fs';
import { SystemProgram, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getAssociatedTokenAddress } from '@solana/spl-token';
// import { IDL } from './buzzing'; 
import { type Buzzing } from './buzzing'; 
import idl from "./buzzing.json";



// 程序ID
const programId = new PublicKey("3gvUXvA5CS8Ya42QKbcFEL682ABqSjEHR4XRYQhpBFcw");

// 代币mint地址
const usdc_mint = new PublicKey("2Tzwa8h4QDd8kXPn89f6K3sHHBERMpmefK84KBFqvdje"); 
// usdc token account: 58Lj2Ey2hCwe2w8AGheLQxWTq4PghzCE8nK2UEgkPxDF

const usdb_mint = new PublicKey("GkdDveBEPxHfWptJKZdTBGCRDB6Le4jSfoRRpSsQWvni");
// usdb token account: 6gdHSxmbVDZnVKMAPAsmGUdpnSRq3FH9gj5KV7VzdBx8

// 加载IDL
// const idl = JSON.parse(fs.readFileSync('./buzzing.json', 'utf8'));


// 初始化provider
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/id.json', 'utf8')));
const walletKeypair = Keypair.fromSecretKey(secretKey);
const wallet = new anchor.Wallet(walletKeypair);
const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=d64ad269-f73b-4885-88d1-359e1faf2ae3", "confirmed");
const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
anchor.setProvider(provider);

// 初始化合约对象
// const program = new anchor.Program(idl, provider);


const program = new anchor.Program<Buzzing>(idl as anchor.Idl,provider);




// 加载用户密钥对
const oracleSecreKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair.json', 'utf8')));
const oracleKeypair = Keypair.fromSecretKey(oracleSecreKey);
// 35bWNQi2HrG7iZuWjU9NxexdR3yamhimjDkhxQQUQkgK

const secretKey1 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair1.json', 'utf8')));
const userKeypair1 = Keypair.fromSecretKey(secretKey1);
// 26jDa3KV9Pcyn6QenpehgzXzVEjwuZdSA34hycP2HmnC

const secretKey2 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair2.json', 'utf8')));
const userKeypair2 = Keypair.fromSecretKey(secretKey2);
// X3XeRdP1wLJ6CsPW3bpotRNLd6pt6cWmMKK6nA99vWm

const secretKey3 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair3.json', 'utf8')));
const userKeypair3 = Keypair.fromSecretKey(secretKey3);
// 8GgHNWyBT7bsyKctkKaMAtG6z1N2ZAD4UKq6YtvbUAxQ

export {
  anchor,
  SystemProgram,
  PublicKey,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  programId,
  usdc_mint,
  usdb_mint,
  // idl,
  walletKeypair,
  wallet,
  connection,
  provider,
  program,
  oracleKeypair,
  userKeypair1,
  userKeypair2,
  userKeypair3
}; 