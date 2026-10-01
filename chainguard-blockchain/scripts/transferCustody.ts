import { network } from "hardhat";

async function main() {
  const connection = await network.connect();

  const [analyst] = await connection.ethers.getSigners();

  const contract = await connection.ethers.getContractAt(
    "ChainOfCustody",
    "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
  );

  console.log("New custodian wallet:", analyst.address);

  const tx = await contract.transferCustody(
    "EVID-001",
    "ANALYSIS"
  );

  console.log("Transfer transaction:", tx.hash);

  await tx.wait();

  console.log("Custody transferred successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});