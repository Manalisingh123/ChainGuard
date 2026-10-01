import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChainOfCustodyModule = buildModule("ChainOfCustodyModule", (m) => {
  const chainOfCustody = m.contract("ChainOfCustody");

  return { chainOfCustody };
});

export default ChainOfCustodyModule;