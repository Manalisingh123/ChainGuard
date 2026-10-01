const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
);

const artifact = require("../artifacts/contracts/ChainOfCustody.sol/ChainOfCustody.json");

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    artifact.abi,
    wallet
);

module.exports = {
    provider,
    wallet,
    contract
};