import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
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