import { Component } from "react";

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
    // Also log to window for easy debugging on mobile
    window.__ERROR_BOUNDARY_ERROR = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "Unknown error";
      const componentStack = this.state.errorInfo?.componentStack || "";
      // Extract first meaningful line from component stack
      const stackLines = componentStack.split("\n").filter(l => l.trim());
      const firstComponent = stackLines.length > 1 ? stackLines[1]?.trim() : "";

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
              maxWidth: "420px",
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
            {/* Show error details for debugging on mobile */}
            <details
              style={{
                marginBottom: "16px",
                textAlign: "left",
                width: "100%",
              }}
            >
              <summary
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  cursor: "pointer",
                  padding: "4px 0",
                  userSelect: "none",
                }}
              >
                Tap to see error details
              </summary>
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  background: "#FEF2F2",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#991B1B",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  maxHeight: "120px",
                  overflow: "auto",
                }}
              >
                <strong>Error:</strong> {errorMsg}
                {firstComponent && (
                  <><br /><strong>At:</strong> {firstComponent}</>
                )}
              </div>
            </details>
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
