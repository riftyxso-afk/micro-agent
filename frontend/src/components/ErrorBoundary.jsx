import { Component } from "react";

// Collect recent console messages (warn/error) before a crash
const MAX_LOGS = 20;
let consoleLogs = [];
let interceptorsInstalled = false;

function installConsoleInterceptors() {
  if (interceptorsInstalled || typeof window === "undefined") return;
  interceptorsInstalled = true;

  const origWarn = console.warn;
  const origError = console.error;

  console.warn = (...args) => {
    try {
      consoleLogs.push({ type: "warn", time: new Date().toLocaleTimeString(), msg: args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ") });
      if (consoleLogs.length > MAX_LOGS) consoleLogs = consoleLogs.slice(-MAX_LOGS);
    } catch {}
    origWarn.apply(console, args);
  };

  console.error = (...args) => {
    try {
      consoleLogs.push({ type: "error", time: new Date().toLocaleTimeString(), msg: args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ") });
      if (consoleLogs.length > MAX_LOGS) consoleLogs = consoleLogs.slice(-MAX_LOGS);
    } catch {}
    origError.apply(console, args);
  };

  // Also capture unhandled errors/rejections
  window.addEventListener("error", (e) => {
    try {
      consoleLogs.push({ type: "error", time: new Date().toLocaleTimeString(), msg: `[Unhandled] ${e.message || "Unknown"} at ${e.filename || ""}:${e.lineno || ""}:${e.colno || ""}` });
    } catch {}
  });

  window.addEventListener("unhandledrejection", (e) => {
    try {
      consoleLogs.push({ type: "error", time: new Date().toLocaleTimeString(), msg: `[Unhandled Promise] ${e.reason?.message || e.reason || "Unknown"}` });
    } catch {}
  });
}

// Install immediately so we capture logs from app startup
if (typeof window !== "undefined") {
  installConsoleInterceptors();
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.setState({ errorInfo });
    // Capture the crash error itself
    try {
      consoleLogs.push({ type: "crash", time: new Date().toLocaleTimeString(), msg: `[CRASH] ${error?.message || "Unknown"}` });
    } catch {}
    // Also log to window for easy debugging on mobile
    window.__ERROR_BOUNDARY_ERROR = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      consoleLogs: consoleLogs.slice(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  }

  handleRetry = () => {
    consoleLogs = [];
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "Unknown error";
      const errorStack = this.state.error?.stack || "";
      const componentStack = this.state.errorInfo?.componentStack || "";
      const stackLines = componentStack.split("\n").filter(l => l.trim());
      const firstComponent = stackLines.length > 1 ? stackLines[1]?.trim() : "";
      const recentLogs = consoleLogs.slice(-10);

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            fontFamily: "Inter, -apple-system, sans-serif",
            background: "#F7F7F8",
            color: "#111111",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              textAlign: "center",
              background: "#fff",
              borderRadius: "20px",
              padding: "32px 24px",
              boxShadow: "0 1px 3px rgba(17,24,39,0.06)",
              border: "1px solid #E5E7EB",
              width: "100%",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#FEF2F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
                fontFamily: "Space Grotesk, Inter, sans-serif",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                marginBottom: "16px",
                lineHeight: 1.5,
              }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Error + Stack */}
            <details
              open
              style={{ marginBottom: "12px", textAlign: "left", width: "100%" }}
            >
              <summary
                style={{
                  fontSize: "11px", color: "#9CA3AF", cursor: "pointer",
                  padding: "4px 0", userSelect: "none",
                }}
              >
                Error Details
              </summary>
              <div
                style={{
                  marginTop: "6px", padding: "10px",
                  background: "#FEF2F2", borderRadius: "8px",
                  fontSize: "11px", color: "#991B1B",
                  lineHeight: 1.5, wordBreak: "break-word",
                  maxHeight: "100px", overflow: "auto",
                  fontFamily: "monospace",
                }}
              >
                {errorMsg}
                {firstComponent && (
                  <><br /><span style={{ color: "#B45309" }}>at {firstComponent}</span></>
                )}
              </div>
            </details>

            {/* Component Stack */}
            {stackLines.length > 2 && (
              <details
                style={{ marginBottom: "12px", textAlign: "left", width: "100%" }}
              >
                <summary
                  style={{
                    fontSize: "11px", color: "#9CA3AF", cursor: "pointer",
                    padding: "4px 0", userSelect: "none",
                  }}
                >
                  Component Stack ({stackLines.length - 1} frames)
                </summary>
                <div
                  style={{
                    marginTop: "6px", padding: "10px",
                    background: "#F3F4F6", borderRadius: "8px",
                    fontSize: "10px", color: "#374151",
                    lineHeight: 1.6, wordBreak: "break-word",
                    maxHeight: "100px", overflow: "auto",
                    fontFamily: "monospace",
                  }}
                >
                  {stackLines.map((line, i) => (
                    <div key={i} style={{ color: i === 0 ? "#991B1B" : undefined }}>{line}</div>
                  ))}
                </div>
              </details>
            )}

            {/* Console Logs */}
            {recentLogs.length > 0 && (
              <details
                style={{ marginBottom: "12px", textAlign: "left", width: "100%" }}
              >
                <summary
                  style={{
                    fontSize: "11px", color: "#9CA3AF", cursor: "pointer",
                    padding: "4px 0", userSelect: "none",
                  }}
                >
                  Console ({recentLogs.length} messages)
                </summary>
                <div
                  style={{
                    marginTop: "6px", padding: "10px",
                    background: "#111111", borderRadius: "8px",
                    fontSize: "10px", color: "#D1D5DB",
                    lineHeight: 1.6, wordBreak: "break-word",
                    maxHeight: "160px", overflow: "auto",
                    fontFamily: "monospace",
                    textAlign: "left",
                  }}
                >
                  {recentLogs.map((log, i) => (
                    <div key={i} style={{ color: log.type === "error" || log.type === "crash" ? "#FCA5A5" : log.type === "warn" ? "#FDE68A" : "#D1D5DB" }}>
                      <span style={{ opacity: 0.5 }}>[{log.time}]</span>{" "}
                      <span style={{ color: log.type === "error" || log.type === "crash" ? "#EF4444" : log.type === "warn" ? "#F59E0B" : "#6B7280" }}>
                        {log.type === "crash" ? "💥" : log.type === "error" ? "✖" : "⚠"}
                      </span>{" "}
                      {log.msg}
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* User Agent */}
            <div
              style={{
                marginBottom: "16px", fontSize: "9px", color: "#D1D5DB",
                wordBreak: "break-all", lineHeight: 1.4,
              }}
            >
              {navigator.userAgent}
            </div>

            <button
              onClick={this.handleRetry}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background: "#111111",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => (e.target.style.background = "#333")}
              onMouseOut={(e) => (e.target.style.background = "#111111")}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
