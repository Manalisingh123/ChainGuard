import { useEffect, useState } from "react";

function App() {
  const [evidence, setEvidence] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [searchId, setSearchId] = useState("EVID-004");
  const [searching, setSearching] = useState(false);

  // Registration
  const [evidenceId, setEvidenceId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [stage, setStage] = useState("COLLECTION");
  const [file, setFile] = useState(null);

  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState(null);

  // Verification
  const [verifyId, setVerifyId] = useState("EVID-004");
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Fetch evidence
  const fetchEvidence = async (id) => {
    setSearching(true);
    setLoading(true);
    setHistory([]);

    try {
      const response = await fetch(
        `http://localhost:3000/evidence/${id}`
      );

      if (!response.ok) {
        throw new Error("Evidence not found");
      }

      const data = await response.json();

      setEvidence(data);

      // Fetch custody history
      setHistoryLoading(true);

      const historyResponse = await fetch(
        `http://localhost:3000/evidence/${id}/history`
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }
    } catch (error) {
      console.error("Error fetching evidence:", error);
      setEvidence(null);
      setHistory([]);
    } finally {
      setLoading(false);
      setSearching(false);
      setHistoryLoading(false);
    }
  };

  // Load EVID-004 on startup
  useEffect(() => {
    fetchEvidence("EVID-004");
  }, []);

  // Search evidence
  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchId.trim()) {
      alert("Enter an Evidence ID.");
      return;
    }

    fetchEvidence(searchId.trim());
  };

  // Register evidence
  const handleRegister = async (event) => {
    event.preventDefault();

    if (!evidenceId || !caseId || !file) {
      alert("Please fill all required fields.");
      return;
    }

    setRegistering(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("evidence", file);
      formData.append("evidenceId", evidenceId);
      formData.append("caseId", caseId);
      formData.append("stage", stage);

      const response = await fetch(
        "http://localhost:3000/register-evidence",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setResult(data);

      // Display newly registered evidence
      setEvidence({
        evidenceId: data.evidenceId,
        caseId: data.caseId,
        evidenceHash: data.sha256,
        timestamp: "",
        custodian: data.custodian,
        stage: data.stage,
      });

      // Fetch new custody history
      const historyResponse = await fetch(
        `http://localhost:3000/evidence/${data.evidenceId}/history`
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }

      setSearchId(data.evidenceId);
      setVerifyId(data.evidenceId);

      // Clear form
      setEvidenceId("");
      setCaseId("");
      setStage("COLLECTION");
      setFile(null);
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message);
    } finally {
      setRegistering(false);
    }
  };

  // Verify evidence
  const handleVerify = async (event) => {
    event.preventDefault();

    if (!verifyId || !verifyFile) {
      alert("Enter Evidence ID and select a file.");
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();

      formData.append("evidence", verifyFile);
      formData.append("evidenceId", verifyId);

      const response = await fetch(
        "http://localhost:3000/verify-evidence",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerificationResult(data);
    } catch (error) {
      console.error("Verification error:", error);
      alert(error.message);
    } finally {
      setVerifying(false);
    }
  };

  // Convert blockchain timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }

    const date = new Date(Number(timestamp) * 1000);

    return date.toLocaleString();
  };

  return (
    <div>
      <h1>ChainGuard</h1>

      <p>
        Blockchain-Based Digital Evidence Management
      </p>

      <hr />

      {/* Dashboard */}
      <h2>Dashboard</h2>

      <div>
        <h3>Current Evidence</h3>
        <p>
          {evidence ? evidence.evidenceId : "None"}
        </p>
      </div>

      <div>
        <h3>Current Case</h3>
        <p>
          {evidence ? evidence.caseId : "None"}
        </p>
      </div>

      <div>
        <h3>Current Stage</h3>
        <p>
          {evidence ? evidence.stage : "None"}
        </p>
      </div>

      <div>
        <h3>Custody Events</h3>
        <p>{history.length}</p>
      </div>

      <hr />

      {/* Search Evidence */}
      <h2>Find Evidence</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchId}
          placeholder="Enter Evidence ID"
          onChange={(e) => setSearchId(e.target.value)}
        />

        <button
          type="submit"
          disabled={searching}
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      <hr />

      {/* Evidence Details */}
      <h2>Evidence Details</h2>

      {loading && (
        <p>
          Loading evidence from blockchain...
        </p>
      )}

      {!loading && !evidence && (
        <p>
          Evidence not found.
        </p>
      )}

      {evidence && (
        <div>
          <p>
            <strong>Evidence ID:</strong>{" "}
            {evidence.evidenceId}
          </p>

          <p>
            <strong>Case ID:</strong>{" "}
            {evidence.caseId}
          </p>

          <p>
            <strong>SHA-256:</strong>{" "}
            {evidence.evidenceHash}
          </p>

          <p>
            <strong>Custodian:</strong>{" "}
            {evidence.custodian}
          </p>

          <p>
            <strong>Stage:</strong>{" "}
            {evidence.stage}
          </p>

          <p>
            <strong>Blockchain Timestamp:</strong>{" "}
            {formatTimestamp(evidence.timestamp)}
          </p>
        </div>
      )}

      <hr />

      {/* Chain of Custody */}
      <h2>Chain of Custody</h2>

      {historyLoading && (
        <p>
          Loading custody history from blockchain...
        </p>
      )}

      {!historyLoading &&
        history.length === 0 &&
        evidence && (
          <p>
            No custody history found.
          </p>
        )}

      {history.length > 0 && (
        <div>
          {history.map((event, index) => (
            <div key={index}>
              <h3>
                Event {index + 1}
              </h3>

              <p>
                <strong>Stage:</strong>{" "}
                {event.stage}
              </p>

              <p>
                <strong>Custodian:</strong>{" "}
                {event.custodian}
              </p>

              <p>
                <strong>Timestamp:</strong>{" "}
                {formatTimestamp(event.timestamp)}
              </p>

              {index < history.length - 1 && (
                <p>↓</p>
              )}
            </div>
          ))}
        </div>
      )}

      <hr />

      {/* Verify Evidence */}
      <h2>Verify Evidence Integrity</h2>

      <p>
        Upload an evidence file to compare its SHA-256
        hash with the hash stored on the blockchain.
      </p>

      <form onSubmit={handleVerify}>
        <div>
          <label>
            Evidence ID:
            <br />

            <input
              type="text"
              value={verifyId}
              placeholder="EVID-004"
              onChange={(e) =>
                setVerifyId(e.target.value)
              }
            />
          </label>
        </div>

        <br />

        <div>
          <label>
            Evidence File:
            <br />

            <input
              type="file"
              onChange={(e) =>
                setVerifyFile(e.target.files[0])
              }
            />
          </label>
        </div>

        <br />

        <button
          type="submit"
          disabled={verifying}
        >
          {verifying
            ? "Verifying..."
            : "Verify Evidence"}
        </button>
      </form>

      {/* Verification Result */}
      {verificationResult && (
        <div>
          <hr />

          <h2>
            {verificationResult.verified
              ? "✅ Evidence Verified"
              : "⚠️ Evidence Integrity Check Failed"}
          </h2>

          <p>
            <strong>Evidence ID:</strong>{" "}
            {verificationResult.evidenceId}
          </p>

          <p>
            <strong>Uploaded File Hash:</strong>{" "}
            {verificationResult.uploadedHash}
          </p>

          <p>
            <strong>Blockchain Hash:</strong>{" "}
            {verificationResult.blockchainHash}
          </p>

          <p>
            <strong>Result:</strong>{" "}
            {verificationResult.message}
          </p>
        </div>
      )}

      <hr />

      {/* Register Evidence */}
      <h2>Register New Evidence</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>
            Evidence ID:
            <br />

            <input
              type="text"
              placeholder="EVID-005"
              value={evidenceId}
              onChange={(e) =>
                setEvidenceId(e.target.value)
              }
            />
          </label>
        </div>

        <br />

        <div>
          <label>
            Case ID:
            <br />

            <input
              type="text"
              placeholder="CASE-003"
              value={caseId}
              onChange={(e) =>
                setCaseId(e.target.value)
              }
            />
          </label>
        </div>

        <br />

        <div>
          <label>
            Stage:
            <br />

            <select
              value={stage}
              onChange={(e) =>
                setStage(e.target.value)
              }
            >
              <option value="COLLECTION">
                COLLECTION
              </option>

              <option value="ANALYSIS">
                ANALYSIS
              </option>

              <option value="VERIFICATION">
                VERIFICATION
              </option>
            </select>
          </label>
        </div>

        <br />

        <div>
          <label>
            Evidence File:
            <br />

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />
          </label>
        </div>

        <br />

        <button
          type="submit"
          disabled={registering}
        >
          {registering
            ? "Registering..."
            : "Register Evidence"}
        </button>
      </form>

      {/* Registration Result */}
      {result && (
        <div>
          <hr />

          <h2>
            Evidence Registered Successfully
          </h2>

          <p>
            <strong>Evidence ID:</strong>{" "}
            {result.evidenceId}
          </p>

          <p>
            <strong>Case ID:</strong>{" "}
            {result.caseId}
          </p>

          <p>
            <strong>File:</strong>{" "}
            {result.fileName}
          </p>

          <p>
            <strong>SHA-256:</strong>{" "}
            {result.sha256}
          </p>

          <p>
            <strong>Stage:</strong>{" "}
            {result.stage}
          </p>

          <p>
            <strong>Custodian:</strong>{" "}
            {result.custodian}
          </p>

          <p>
            <strong>Transaction Hash:</strong>{" "}
            {result.transactionHash}
          </p>

          <p>
            <strong>Block Number:</strong>{" "}
            {result.blockNumber}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;