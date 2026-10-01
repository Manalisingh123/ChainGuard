import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0"
  );

  const evidence = await contract.evidenceRecords("EVID-001");

  console.log("Evidence ID:", evidence[0]);
  console.log("Case ID:", evidence[1]);
  console.log("Evidence Hash:", evidence[2]);
  console.log("Timestamp:", evidence[3].toString());
  console.log("Custodian:", evidence[4]);
  console.log("Stage:", evidence[5]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});