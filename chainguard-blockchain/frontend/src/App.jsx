import { useEffect, useState } from "react";
import "./App.css";

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

  // Transfer
  const [transferId, setTransferId] = useState("EVID-004");
  const [newStage, setNewStage] = useState("ANALYSIS");
  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

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
      setTransferId(data.evidenceId);
      setVerifyId(data.evidenceId);

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

  useEffect(() => {
    fetchEvidence("EVID-004");
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchId.trim()) {
      alert("Enter an Evidence ID.");
      return;
    }

    fetchEvidence(searchId.trim());
  };

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

      setEvidence({
        evidenceId: data.evidenceId,
        caseId: data.caseId,
        evidenceHash: data.sha256,
        timestamp: "",
        custodian: data.custodian,
        stage: data.stage,
      });

      const historyResponse = await fetch(
        `http://localhost:3000/evidence/${data.evidenceId}/history`
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      }

      setSearchId(data.evidenceId);
      setVerifyId(data.evidenceId);
      setTransferId(data.evidenceId);

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

  const handleTransfer = async (event) => {
    event.preventDefault();

    if (!transferId || !newStage) {
      alert("Enter Evidence ID and select a stage.");
      return;
    }

    setTransferring(true);
    setTransferResult(null);

    try {
      const response = await fetch(
        "http://localhost:3000/transfer-custody",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            evidenceId: transferId,
            newStage: newStage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Custody transfer failed");
      }

      setTransferResult(data);

      await fetchEvidence(transferId);
    } catch (error) {
      console.error("Transfer error:", error);
      alert(error.message);
    } finally {
      setTransferring(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }

    const date = new Date(Number(timestamp) * 1000);

    return date.toLocaleString();
  };

  const shortHash = (value, start = 12, end = 10) => {
    if (!value) return "—";

    if (value.length <= start + end) {
      return value;
    }

    return `${value.slice(0, start)}...${value.slice(-end)}`;
  };

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CG</div>

          <div>
            <div className="brand-name">ChainGuard</div>
            <div className="brand-subtitle">
              Evidence Integrity
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item active">
            <span>01</span>
            Overview
          </a>

          <a href="#evidence" className="nav-item">
            <span>02</span>
            Evidence
          </a>

          <a href="#custody" className="nav-item">
            <span>03</span>
            Chain of Custody
          </a>

          <a href="#verification" className="nav-item">
            <span>04</span>
            Verification
          </a>

          <a href="#register" className="nav-item">
            <span>05</span>
            Register Evidence
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="network-status">
            <span className="status-dot"></span>
            Local Network
          </div>

          <div className="network-id">
            Chain ID 31337
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">

        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="eyebrow">
              DIGITAL EVIDENCE MANAGEMENT
            </div>

            <h1>Investigation Workspace</h1>
          </div>

          <div className="topbar-case">
            <span>ACTIVE EVIDENCE</span>
            <strong>
              {evidence ? evidence.evidenceId : "—"}
            </strong>
          </div>
        </header>

        {/* Overview */}
        <section id="overview" className="section">

          <div className="section-heading">
            <div>
              <span className="section-number">01</span>
              <h2>Evidence Overview</h2>
            </div>

            <div className="live-indicator">
              <span></span>
              Blockchain connected
            </div>
          </div>

          <div className="overview-grid">

            <div className="stat-card">
              <div className="stat-label">
                CURRENT EVIDENCE
              </div>

              <div className="stat-value">
                {evidence ? evidence.evidenceId : "—"}
              </div>

              <div className="stat-meta">
                Evidence identifier
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                CASE
              </div>

              <div className="stat-value">
                {evidence ? evidence.caseId : "—"}
              </div>

              <div className="stat-meta">
                Associated case
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                CURRENT STAGE
              </div>

              <div className="stat-value stage-value">
                {evidence ? evidence.stage : "—"}
              </div>

              <div className="stat-meta">
                Current custody stage
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">
                CUSTODY EVENTS
              </div>

              <div className="stat-value">
                {history.length}
              </div>

              <div className="stat-meta">
                Recorded on chain
              </div>
            </div>

          </div>
        </section>

        {/* Search */}
        <section className="search-panel">

          <div>
            <div className="eyebrow">EVIDENCE LOOKUP</div>

            <h2>Find Evidence</h2>

            <p>
              Retrieve evidence metadata and its custody history
              directly from the blockchain.
            </p>
          </div>

          <form onSubmit={handleSearch} className="search-form">

            <input
              type="text"
              value={searchId}
              placeholder="Evidence ID"
              onChange={(e) => setSearchId(e.target.value)}
            />

            <button
              type="submit"
              disabled={searching}
            >
              {searching ? "Searching..." : "Search Evidence"}
            </button>

          </form>
        </section>

        {/* Evidence */}
        <section id="evidence" className="section">

          <div className="section-heading">
            <div>
              <span className="section-number">02</span>
              <h2>Evidence Record</h2>
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              Loading evidence from blockchain...
            </div>
          )}

          {!loading && !evidence && (
            <div className="empty-state">
              Evidence not found.
            </div>
          )}

          {evidence && (
            <div className="evidence-card">

              <div className="evidence-header">

                <div>
                  <div className="eyebrow">
                    EVIDENCE IDENTIFIER
                  </div>

                  <div className="evidence-id">
                    {evidence.evidenceId}
                  </div>
                </div>

                <div className="stage-badge">
                  {evidence.stage}
                </div>

              </div>

              <div className="details-grid">

                <div className="detail-item">
                  <span>Case ID</span>
                  <strong>{evidence.caseId}</strong>
                </div>

                <div className="detail-item">
                  <span>Custodian</span>

                  <strong className="mono">
                    {shortHash(evidence.custodian, 14, 8)}
                  </strong>
                </div>

                <div className="detail-item wide">
                  <span>SHA-256 Evidence Hash</span>

                  <strong className="hash">
                    {evidence.evidenceHash}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>Blockchain Timestamp</span>

                  <strong>
                    {formatTimestamp(evidence.timestamp)}
                  </strong>
                </div>

              </div>

            </div>
          )}
        </section>

        {/* Custody */}
        <section id="custody" className="section">

          <div className="section-heading">
            <div>
              <span className="section-number">03</span>
              <h2>Chain of Custody</h2>
            </div>

            <span className="record-count">
              {history.length} recorded event
              {history.length !== 1 ? "s" : ""}
            </span>
          </div>

          {historyLoading && (
            <div className="empty-state">
              Loading custody history...
            </div>
          )}

          {!historyLoading &&
            history.length === 0 &&
            evidence && (
              <div className="empty-state">
                No custody history found.
              </div>
            )}

          {history.length > 0 && (
            <div className="timeline">

              {history.map((event, index) => (

                <div className="timeline-item" key={index}>

                  <div className="timeline-marker">
                    <span></span>
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-top">

                      <div>
                        <span className="event-number">
                          EVENT {String(index + 1).padStart(2, "0")}
                        </span>

                        <h3>{event.stage}</h3>
                      </div>

                      <span className="timeline-time">
                        {formatTimestamp(event.timestamp)}
                      </span>

                    </div>

                    <div className="timeline-custodian">
                      <span>Custodian</span>

                      <strong className="mono">
                        {event.custodian}
                      </strong>
                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}
        </section>

        {/* Transfer */}
        <section className="operation-grid">

          <div className="operation-card">

            <div className="eyebrow">
              CUSTODY OPERATION
            </div>

            <h2>Transfer Custody</h2>

            <p className="operation-description">
              Record the movement of an evidence item to its
              next processing stage.
            </p>

            <form onSubmit={handleTransfer}>

              <div className="field">
                <label>Evidence ID</label>

                <input
                  type="text"
                  value={transferId}
                  placeholder="EVID-004"
                  onChange={(e) =>
                    setTransferId(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>New Stage</label>

                <select
                  value={newStage}
                  onChange={(e) =>
                    setNewStage(e.target.value)
                  }
                >
                  <option value="ANALYSIS">
                    ANALYSIS
                  </option>

                  <option value="VERIFICATION">
                    VERIFICATION
                  </option>

                  <option value="COLLECTION">
                    COLLECTION
                  </option>
                </select>
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={transferring}
              >
                {transferring
                  ? "Recording transfer..."
                  : "Record Custody Transfer"}
              </button>

            </form>

            {transferResult && (

              <div className="operation-result success">

                <div className="result-title">
                  Transfer recorded
                </div>

                <div className="result-row">
                  <span>Stage</span>
                  <strong>{transferResult.newStage}</strong>
                </div>

                <div className="result-row">
                  <span>Block</span>
                  <strong>{transferResult.blockNumber}</strong>
                </div>

                <div className="result-row">
                  <span>Transaction</span>

                  <strong className="mono">
                    {shortHash(
                      transferResult.transactionHash,
                      16,
                      10
                    )}
                  </strong>
                </div>

              </div>

            )}

          </div>

          {/* Verification */}
          <div
            id="verification"
            className="operation-card"
          >

            <div className="eyebrow">
              INTEGRITY CHECK
            </div>

            <h2>Verify Evidence</h2>

            <p className="operation-description">
              Recalculate the file hash and compare it with
              the immutable blockchain record.
            </p>

            <form onSubmit={handleVerify}>

              <div className="field">
                <label>Evidence ID</label>

                <input
                  type="text"
                  value={verifyId}
                  placeholder="EVID-004"
                  onChange={(e) =>
                    setVerifyId(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Evidence File</label>

                <input
                  type="file"
                  onChange={(e) =>
                    setVerifyFile(e.target.files[0])
                  }
                />
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={verifying}
              >
                {verifying
                  ? "Checking integrity..."
                  : "Run Integrity Check"}
              </button>

            </form>

            {verificationResult && (

              <div
                className={`operation-result ${
                  verificationResult.verified
                    ? "success"
                    : "failure"
                }`}
              >

                <div className="result-title">
                  {verificationResult.verified
                    ? "Evidence verified"
                    : "Integrity check failed"}
                </div>

                <div className="result-row">
                  <span>Evidence</span>
                  <strong>
                    {verificationResult.evidenceId}
                  </strong>
                </div>

                <div className="hash-result">
                  <span>Uploaded hash</span>

                  <code>
                    {verificationResult.uploadedHash}
                  </code>
                </div>

                <div className="hash-result">
                  <span>Blockchain hash</span>

                  <code>
                    {verificationResult.blockchainHash}
                  </code>
                </div>

              </div>

            )}

          </div>

        </section>

        {/* Register */}
        <section
          id="register"
          className="section register-section"
        >

          <div className="section-heading">
            <div>
              <span className="section-number">04</span>
              <h2>Register New Evidence</h2>
            </div>
          </div>

          <div className="register-card">

            <div className="register-intro">

              <div className="eyebrow">
                NEW EVIDENCE RECORD
              </div>

              <h2>Create Evidence Record</h2>

              <p>
                Upload the original evidence file. ChainGuard
                will calculate its SHA-256 hash and register
                the integrity record on the blockchain.
              </p>

            </div>

            <form
              onSubmit={handleRegister}
              className="register-form"
            >

              <div className="field">
                <label>Evidence ID</label>

                <input
                  type="text"
                  placeholder="EVID-005"
                  value={evidenceId}
                  onChange={(e) =>
                    setEvidenceId(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Case ID</label>

                <input
                  type="text"
                  placeholder="CASE-003"
                  value={caseId}
                  onChange={(e) =>
                    setCaseId(e.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Initial Stage</label>

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
              </div>

              <div className="field">
                <label>Evidence File</label>

                <input
                  type="file"
                  onChange={(e) =>
                    setFile(e.target.files[0])
                  }
                />
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={registering}
              >
                {registering
                  ? "Registering evidence..."
                  : "Register Evidence"}
              </button>

            </form>

            {result && (

              <div className="registration-result">

                <div className="result-title">
                  Evidence registered successfully
                </div>

                <div className="registration-grid">

                  <div>
                    <span>Evidence ID</span>
                    <strong>{result.evidenceId}</strong>
                  </div>

                  <div>
                    <span>Case ID</span>
                    <strong>{result.caseId}</strong>
                  </div>

                  <div>
                    <span>Stage</span>
                    <strong>{result.stage}</strong>
                  </div>

                  <div>
                    <span>Block</span>
                    <strong>{result.blockNumber}</strong>
                  </div>

                  <div className="wide">
                    <span>SHA-256</span>
                    <code>{result.sha256}</code>
                  </div>

                  <div className="wide">
                    <span>Transaction</span>
                    <code>{result.transactionHash}</code>
                  </div>

                </div>

              </div>

            )}

          </div>
        </section>

        <footer className="footer">
          <span>ChainGuard</span>
          <span>Blockchain Evidence Integrity System</span>
          <span>Local Development Network</span>
        </footer>

      </main>
    </div>
  );
}

export default App;