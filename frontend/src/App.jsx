
import { useState } from "react";
import "./App.css";
import { loginUser, registerUser } from "./api";
import { saveToken, clearToken } from "./auth";

const createMockResult = (url) => ({
  id: "demo-scan-001",
  url,
  riskScore: 87,
  verdict: "Phishing",
  flags: [
    { label: "No HTTPS", severity: "high" },
    { label: "Recently registered domain", severity: "high" },
    { label: "Similar to a known brand", severity: "high" },
    { label: "Suspicious URL patterns", severity: "medium" },
  ],
  scannedAt: new Date().toISOString(),
});

const initialHistory = [
  {
    id: "scan-001",
    url: "https://paypa1-secure-login.com",
    riskScore: 87,
    verdict: "Phishing",
    scannedAt: "2026-10-12T09:15:00",
  },
  {
    id: "scan-002",
    url: "https://example.com",
    riskScore: 24,
    verdict: "Safe",
    scannedAt: "2026-10-11T15:30:00",
  },
  {
    id: "scan-003",
    url: "http://unknown-login.test",
    riskScore: 55,
    verdict: "Suspicious",
    scannedAt: "2026-10-10T12:45:00",
  },
];


function App() {
  const [page, setPage] = useState("scan");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [scanResult, setScanResult] = useState(null);
const [history, setHistory] = useState(initialHistory);

  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const data =
        authMode === "register"
          ? await registerUser(name.trim(), email.trim(), password)
          : await loginUser(email.trim(), password);

      if (!data.token || !data.user) {
        throw new Error("The server returned an unexpected response.");
      }

      saveToken(data.token);
      setUser(data.user);
      setPassword("");
      setAuthMessage("Authentication successful.");
      setPage("scan");
    } catch (err) {
      setAuthError(
        err.message ||
          "Could not connect. Check whether the backend is running."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setUrl("");
    setError("");
    setMessage("");
    setScanResult(null);
    setAuthError("");
    setAuthMessage("");
    setPage("scan");
  };

  const handleScan = () => {
    setError("");
    setMessage("");
    setScanResult(null);

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes(".")
      ) {
        throw new Error("Invalid URL");
      }

      setMessage("URL format is valid. Showing simulated results.");

      // Demo only. Not a real phishing assessment.
      setScanResult(createMockResult(parsedUrl.href));
    } catch {
      setError("Please enter a valid HTTP or HTTPS URL.");
    }
  };

  const handleScanAgain = () => {
    setUrl("");
    setError("");
    setMessage("");
    setScanResult(null);
  };

  const getVerdictClass = (verdict) => verdict.toLowerCase();

  return (
    <div className="app">
      <nav className="navbar">
        <button
          type="button"
          className="logo logo-button"
          onClick={() => setPage("scan")}
        >
          PHISHGUARD
        </button>

        <div className="nav-links">
          <button type="button" onClick={() => setPage("scan")}>
            Scan
          </button>

         
<button type="button" onClick={() => setPage("history")}>
  History
</button>


          {user ? (
            <>
              <span className="nav-user">
                {user.name || user.email}
              </span>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                  setPage("auth");
                }}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                  setPage("auth");
                }}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      
{page === "history" ? (
  <main className="scan-container">
    <section className="scan-card history-card">
      <p className="result-label">YOUR ACTIVITY</p>
      <h1>Scan History</h1>
      <p className="subtitle">
        Review your previous URL scan demonstrations.
      </p>

      <div className="history-notice">
        DEMO MODE — These records are fictional.
      </div>

      {history.length === 0 ? (
        <p className="result-note">
          No scan records yet.
        </p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-item" key={item.id}>
              <div className="history-item-top">
                <span
                  className={`risk-badge ${item.verdict.toLowerCase()}`}
                >
                  {item.verdict}
                </span>

                <strong>{item.riskScore}/100</strong>
              </div>

              <p className="history-url">{item.url}</p>

              <p className="scan-timestamp">
                {new Date(item.scannedAt).toLocaleString()}
              </p>

              <button
                type="button"
                className="scan-again-button"
                onClick={() =>
                  setHistory((previous) =>
                    previous.filter(
                      (record) => record.id !== item.id
                    )
                  )
                }
              >
                Delete record
              </button>
            </article>
          ))}
        </div>
      )}

      <button
        type="button"
        className="scan-button"
        onClick={() => setPage("scan")}
      >
        ← Back to Scanner
      </button>
    </section>
  </main>
) : page === "auth" ? (

        <main className="auth-container">
          <section className="auth-card">
            <div className="shield">🛡️</div>

            <p className="result-label">PHISHGUARD SECURITY</p>

            <h1>
              {authMode === "login"
                ? "Welcome Back"
                : "Create Your Account"}
            </h1>

            <p className="subtitle">
              {authMode === "login"
                ? "Sign in to continue to your security dashboard."
                : "Create an account to access your security dashboard."}
            </p>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </div>

              {authError && (
                <p className="error-message" role="alert">
                  {authError}
                </p>
              )}

              {authMessage && (
                <p className="success-message" role="status">
                  {authMessage}
                </p>
              )}

              <button
                type="submit"
                className="scan-button"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(
                    authMode === "login" ? "register" : "login"
                  );
                  setAuthError("");
                  setAuthMessage("");
                }}
              >
                {authMode === "login" ? "Register" : "Login"}
              </button>
            </p>

            <p className="auth-disclaimer">
              Authentication requires the project backend to be running.
            </p>
          </section>
        </main>
      ) : (
        <main className="scan-container">
          <div className="scan-card">
            <div className="shield">🛡️</div>

            <h1>Phishing URL Detector</h1>

            <p className="subtitle">
              Check a URL before you trust it.
            </p>

            {user && (
              <p className="user-welcome">
                Signed in as {user.name || user.email}
              </p>
            )}

            <div className="input-section">
              <label htmlFor="url">Enter a URL</label>

              <input
                id="url"
                type="text"
                inputMode="url"
                className={
                  error
                    ? "invalid-input"
                    : message
                      ? "valid-input"
                      : ""
                }
                placeholder="https://example.com"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError("");
                  setMessage("");
                  setScanResult(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleScan();
                }}
              />

              {error && <p className="error-message">{error}</p>}

              {message && (
                <p className="success-message">{message}</p>
              )}

              <button
                type="button"
                className="scan-button"
                onClick={handleScan}
              >
                Scan URL
              </button>

              {scanResult && (
                <section className="result-panel">
                  <p className="result-label">SCAN RESULT</p>

                  <h2>URL Analysis Report</h2>

                  <p className="result-url">{scanResult.url}</p>

                  <div className="demo-notice">
                    DEMO MODE — NOT A REAL SECURITY SCAN
                  </div>

                  <div className="risk-card">
                    <div className="risk-score-area">
                      <p className="detail-label">RISK SCORE</p>

                      <h3 className="risk-score">
                        {scanResult.riskScore}
                        <span> / 100</span>
                      </h3>

                      <div
                        className="risk-meter"
                        role="progressbar"
                        aria-label="Simulated risk score"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={scanResult.riskScore}
                      >
                        <div className="risk-meter-track">
                          <div
                            className={`risk-meter-fill ${getVerdictClass(
                              scanResult.verdict
                            )}`}
                            style={{
                              width: `${scanResult.riskScore}%`,
                            }}
                          />
                        </div>
                        <p>Simulated score for demonstration</p>
                      </div>
                    </div>

                    <div
                      className={`risk-badge ${getVerdictClass(
                        scanResult.verdict
                      )}`}
                    >
                      {scanResult.verdict.toUpperCase()}
                    </div>
                  </div>

                  <div
                    className={`result-status ${getVerdictClass(
                      scanResult.verdict
                    )}`}
                  >
                    Simulated verdict: {scanResult.verdict}
                  </div>

                  <div className="detection-section">
                    <h3>Detection Details</h3>

                    {scanResult.flags.length === 0 ? (
                      <p className="result-note">
                        No simulated warning flags.
                      </p>
                    ) : (
                      scanResult.flags.map((flag, index) => (
                        <div
                          className="detection-row"
                          key={`${flag.label}-${index}`}
                        >
                          <span>{flag.label}</span>

                          <span
                            className={`severity-badge ${flag.severity}`}
                          >
                            <span className="status-dot" />
                            {flag.severity}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <p className="result-note">
                    Scores, verdicts, and flags are mock data. They
                    do not describe the actual safety of this URL.
                    Real analysis requires the backend API.
                  </p>

                  <p className="scan-timestamp">
                    Demo timestamp:{" "}
                    {new Date(scanResult.scannedAt).toLocaleString()}
                  </p>

                  <button
                    type="button"
                    className="scan-again-button"
                    onClick={handleScanAgain}
                  >
                    ← Scan Another URL
                  </button>
                </section>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
