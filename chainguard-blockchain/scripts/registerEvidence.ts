import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const [investigator] = await connection.ethers.getSigners();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  console.log("Investigator wallet:", investigator.address);

  const tx = await contract.registerEvidence(
    "EVID-001",
    "CASE-001",
    "abc123456789fakehash",
    "COLLECTION"
  );

  console.log("Transaction sent:", tx.hash);

  await tx.wait();

  console.log("Evidence registered successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});