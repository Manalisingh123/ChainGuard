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
    struct CustodyEvent {
    address custodian;
    uint256 timestamp;
    string stage;
    }

    mapping(string => Evidence) public evidenceRecords;
    mapping(string => CustodyEvent[]) public custodyHistory;

    event EvidenceRegistered(
    string evidenceId,
    string caseId,
    string evidenceHash,
    address custodian,
    uint256 timestamp,
    string stage
    );

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

        custodyHistory[_evidenceId].push(
    CustodyEvent({
        custodian: msg.sender,
        timestamp: block.timestamp,
        stage: _stage
            })
        );

        emit EvidenceRegistered(
        _evidenceId,
        _caseId,
        _evidenceHash,
        msg.sender,
        block.timestamp,
        _stage
    );

    }

    function transferCustody(
    string memory _evidenceId,
    string memory _newStage
    ) public {

    Evidence storage evidence = evidenceRecords[_evidenceId];

    evidence.custodian = msg.sender;
    evidence.timestamp = block.timestamp;
    evidence.stage = _newStage;

    custodyHistory[_evidenceId].push(
        CustodyEvent({
            custodian: msg.sender,
            timestamp: block.timestamp,
            stage: _newStage
        })
    );
}



function getCustodyHistoryLength(
    string memory _evidenceId
) public view returns (uint256) {
    return custodyHistory[_evidenceId].length;
}
}