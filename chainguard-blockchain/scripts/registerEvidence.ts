import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const [investigator] = await connection.ethers.getSigners();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0"
  );

  console.log("Investigator wallet:", investigator.address);

  const tx = await contract.registerEvidence(
    "EVID-002",
    "CASE-001",
    "abc123456789fakehash",
    "COLLECTION"
  );

  console.log("Transaction sent:", tx.hash);

  const receipt = await tx.wait();

console.log("Evidence registered successfully!");

console.log("Transaction receipt:", receipt);

if (receipt) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);

      if (parsed) {
        console.log("Event:", parsed.name);
        console.log("Event Data:", parsed.args);
      }
    } catch {
      // Ignore logs that are not from our contract
    }
  }
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});