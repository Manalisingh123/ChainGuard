import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
  );

  const historyLength =
    await contract.getCustodyHistoryLength("EVID-001");

  console.log("Custody History:");
  console.log("Total Events:", historyLength.toString());

  for (let i = 0; i < Number(historyLength); i++) {
    const event = await contract.custodyHistory("EVID-001", i);

    console.log(`\nEvent ${i + 1}`);
    console.log("Custodian:", event[0]);
    console.log("Timestamp:", event[1].toString());
    console.log("Stage:", event[2]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});