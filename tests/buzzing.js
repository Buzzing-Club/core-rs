const anchor = require('@project-serum/anchor');
const { SystemProgram, PublicKey } = anchor.web3;

// Initialize the provider
const provider = anchor.Provider.env();
anchor.setProvider(provider);

// Get the program
const program = anchor.workspace.Buzzing;

// Market functions
async function initializeMarket() {
    const transaction = await program.methods
        .initializeMarket()
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function initializeOracle() {
    const transaction = await program.methods
        .initializeOracle()
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

// Topic functions
async function createTopic(topicIpfsHash) {
    const transaction = await program.methods
        .createTopic(topicIpfsHash)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function endTopic(winningToken, topicId) {
    const transaction = await program.methods
        .endTopic(winningToken, new anchor.BN(topicId))
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

// Swap functions
async function swapUsdcUsdb(amount, isUsdcToUsdb) {
    const transaction = await program.methods
        .swapUsdcUsdb(new anchor.BN(amount), isUsdcToUsdb)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function yesSwap(amountIn, isNoToUsdb) {
    const transaction = await program.methods
        .yesSwap(new anchor.BN(amountIn), isNoToUsdb)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function noSwap(amountIn, isNoToUsdb) {
    const transaction = await program.methods
        .noSwap(new anchor.BN(amountIn), isNoToUsdb)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

// Strategy functions
async function addStrategy(usedPrincipalPercent, apy) {
    const transaction = await program.methods
        .addStrategy(usedPrincipalPercent, apy)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function toggleStrategy(active) {
    const transaction = await program.methods
        .toggleStrategy(active)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function updateStrategyApr(newApy) {
    const transaction = await program.methods
        .updateStrategyApr(newApy)
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

// Deposit and Withdraw functions
async function deposit(strategyId, amount) {
    const transaction = await program.methods
        .deposit(strategyId, new anchor.BN(amount))
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

async function withdraw(strategyId, amount) {
    const transaction = await program.methods
        .withdraw(strategyId, new anchor.BN(amount))
        .accounts({
            // Add required accounts here
        })
        .rpc();
    return transaction;
}

// Export all functions
module.exports = {
    initializeMarket,
    initializeOracle,
    createTopic,
    endTopic,
    swapUsdcUsdb,
    yesSwap,
    noSwap,
    addStrategy,
    toggleStrategy,
    updateStrategyApr,
    deposit,
    withdraw
}; 