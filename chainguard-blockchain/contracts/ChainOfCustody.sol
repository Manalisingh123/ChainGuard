// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract ChainOfCustody {

    struct Evidence {
        string evidenceId;
        string caseId;
        string evidenceHash;
        uint256 timestamp;
        address custodian;
        string stage;
    }

    mapping(string => Evidence) public evidenceRecords;

    function registerEvidence(
        string memory _evidenceId,
        string memory _caseId,
        string memory _evidenceHash,
        string memory _stage
    ) public {

        evidenceRecords[_evidenceId] = Evidence({
            evidenceId: _evidenceId,
            caseId: _caseId,
            evidenceHash: _evidenceHash,
            timestamp: block.timestamp,
            custodian: msg.sender,
            stage: _stage
        });

    }
}