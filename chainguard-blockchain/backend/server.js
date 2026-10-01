const { provider, wallet, contract } = require("./blockchain");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
    res.json({
        message: "ChainGuard Backend is running!"
    });
});

app.post("/hash-evidence", upload.single("evidence"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: "No evidence file uploaded"
        });
    }

    const hash = crypto
        .createHash("sha256")
        .update(req.file.buffer)
        .digest("hex");

    res.json({
        fileName: req.file.originalname,
        fileSize: req.file.size,
        sha256: hash
    });
});

app.post("/register-evidence", upload.single("evidence"), async (req, res) => {

    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No evidence file uploaded"
            });
        }

        const { evidenceId, caseId, stage } = req.body;

        if (!evidenceId || !caseId || !stage) {
            return res.status(400).json({
                error: "evidenceId, caseId and stage are required"
            });
        }

        // 1. Calculate SHA-256 hash of uploaded evidence
        const hash = crypto
            .createHash("sha256")
            .update(req.file.buffer)
            .digest("hex");

        console.log("Evidence hash:", hash);

        // 2. Register evidence on blockchain
        const tx = await contract.registerEvidence(
            evidenceId,
            caseId,
            hash,
            stage
        );

        console.log("Blockchain transaction:", tx.hash);

        // 3. Wait for blockchain confirmation
        const receipt = await tx.wait();

        console.log("Evidence registered on blockchain!");

        res.json({
            success: true,
            evidenceId: evidenceId,
            caseId: caseId,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            sha256: hash,
            stage: stage,
            custodian: wallet.address,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/blockchain-status", async (req, res) => {
    try {
        const network = await provider.getNetwork();

        res.json({
            connected: true,
            wallet: wallet.address,
            contract: process.env.CONTRACT_ADDRESS,
            chainId: network.chainId.toString()
        });
    } catch (error) {
        res.status(500).json({
            connected: false,
            error: error.message
        });
    }
});

app.get("/evidence/:evidenceId", async (req, res) => {

    try {
        const evidenceId = req.params.evidenceId;

        const evidence = await contract.evidenceRecords(evidenceId);

        // Check whether evidence exists
        if (evidence[0] === "") {
            return res.status(404).json({
                error: "Evidence not found"
            });
        }

        res.json({
            evidenceId: evidence[0],
            caseId: evidence[1],
            evidenceHash: evidence[2],
            timestamp: evidence[3].toString(),
            custodian: evidence[4],
            stage: evidence[5]
        });

    } catch (error) {

        console.error("Read error:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.post("/transfer-custody", async (req, res) => {

    try {
        const { evidenceId, newStage } = req.body;

        if (!evidenceId || !newStage) {
            return res.status(400).json({
                error: "evidenceId and newStage are required"
            });
        }

        console.log("Transferring custody...");
        console.log("Evidence:", evidenceId);
        console.log("New stage:", newStage);
        console.log("New custodian:", wallet.address);

        // Call smart contract
        const tx = await contract.transferCustody(
            evidenceId,
            newStage
        );

        console.log("Transaction sent:", tx.hash);

        // Wait for blockchain confirmation
        const receipt = await tx.wait();

        console.log("Custody transfer confirmed!");

        res.json({
            success: true,
            evidenceId: evidenceId,
            newCustodian: wallet.address,
            newStage: newStage,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {

        console.error("Transfer error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/evidence/:evidenceId/history", async (req, res) => {

    try {
        const evidenceId = req.params.evidenceId;

        const historyLength =
            await contract.getCustodyHistoryLength(evidenceId);

        const history = [];

        for (let i = 0; i < Number(historyLength); i++) {

            const event =
                await contract.custodyHistory(evidenceId, i);

            history.push({
                custodian: event[0],
                timestamp: event[1].toString(),
                stage: event[2]
            });
        }

        res.json({
            evidenceId: evidenceId,
            totalEvents: history.length,
            history: history
        });

    } catch (error) {

        console.error("History error:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.post(
    "/verify-evidence",
    upload.single("evidence"),
    async (req, res) => {

        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "No evidence file uploaded"
                });
            }

            const { evidenceId } = req.body;

            if (!evidenceId) {
                return res.status(400).json({
                    error: "evidenceId is required"
                });
            }

            // Calculate SHA-256 of uploaded file
            const uploadedHash = crypto
                .createHash("sha256")
                .update(req.file.buffer)
                .digest("hex");

            console.log("Uploaded file hash:", uploadedHash);

            // Read original hash from blockchain
            const evidence =
                await contract.evidenceRecords(evidenceId);

            if (evidence[0] === "") {
                return res.status(404).json({
                    error: "Evidence not found"
                });
            }

            const blockchainHash = evidence[2];

            console.log(
                "Blockchain evidence hash:",
                blockchainHash
            );

            // Compare hashes
            const verified =
                uploadedHash === blockchainHash;

            res.json({
                success: true,
                evidenceId: evidenceId,
                uploadedHash: uploadedHash,
                blockchainHash: blockchainHash,
                verified: verified,
                message: verified
                    ? "Evidence verified successfully"
                    : "Evidence hash does not match blockchain record"
            });

        } catch (error) {

            console.error(
                "Verification error:",
                error
            );

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`ChainGuard backend running on http://localhost:${PORT}`);
});