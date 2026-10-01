import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const signers = await connection.ethers.getSigners();
const analyst = signers[1];

 const contract = await connection.ethers.getContractAt(
  "ChainOfCustody",
  "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  analyst
);

  console.log("New custodian wallet:", analyst.address);

  const tx = await contract.transferCustody(
    "EVID-002",
    "ANALYSIS"
  );

  console.log("Transfer transaction:", tx.hash);

  const receipt = await tx.wait();

console.log("Custody transferred successfully!");

if (receipt) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);

      if (parsed) {
        console.log("Event:", parsed.name);
        console.log("Event Data:", parsed.args);
      }
    } catch {
      // Ignore unrelated logs
    }
  }
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});