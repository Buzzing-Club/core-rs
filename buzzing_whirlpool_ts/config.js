// const anchor = require('@project-serum/anchor');
const anchor = require('@coral-xyz/anchor');
const fs = require('fs');
const { SystemProgram, Keypair, PublicKey } = anchor.web3;
const TOKEN_PROGRAM_ID = anchor.utils.token.TOKEN_PROGRAM_ID;
const ASSOCIATED_PROGRAM_ID = anchor.utils.token.ASSOCIATED_PROGRAM_ID;
const { getAssociatedTokenAddress } = require('@solana/spl-token');

// 程序ID
const programId = new PublicKey("2vfnTzPBwz2Ci5ESx6uzfvgfftcTkXGWqNZuhqYTw8zX");

// 代币mint地址
const usdc_mint = new PublicKey("FAPAXaRYvUX1kPukFRD5kTTJj3R34pjsMskZjhbcFSD7"); 
// usdc token account: 2W97aC3sS3mUXhLBihuErL5rxGHy2bqi1BggAU2WC2At
const usdb_mint = new PublicKey("39yKLL814cP4SkboR29udcDG2Jd1V3XP3vstL5QEQJkx");
// usdb token account:F5oQXmZpcfbNp3CtMhuhViJMy2HW4nvE1FrvbWK9RymK

// 加载IDL
const idl = JSON.parse(fs.readFileSync('./buzzing.json', 'utf8'));

// 初始化provider
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/id.json', 'utf8')));
const walletKeypair = Keypair.fromSecretKey(secretKey);
const wallet = new anchor.Wallet(walletKeypair);
const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
anchor.setProvider(provider);

// 初始化合约对象
const program = new anchor.Program(idl, programId, provider);

// 加载用户密钥对
const oracleSecreKey = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair.json', 'utf8')));
const oracleKeypair = Keypair.fromSecretKey(oracleSecreKey);

const secretKey1 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair1.json', 'utf8')));
const userKeypair1 = Keypair.fromSecretKey(secretKey1);

const secretKey2 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair2.json', 'utf8')));
const userKeypair2 = Keypair.fromSecretKey(secretKey2);

const secretKey3 = Uint8Array.from(JSON.parse(fs.readFileSync('./keypair/keypair3.json', 'utf8')));
const userKeypair3 = Keypair.fromSecretKey(secretKey3);

module.exports = {
  anchor,
  SystemProgram,
  PublicKey,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_PROGRAM_ID,
  getAssociatedTokenAddress,
  programId,
  usdc_mint,
  usdb_mint,
  idl,
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