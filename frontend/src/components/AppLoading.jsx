export function AppLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#F7F7F8",
        fontFamily: "Inter, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid #E5E7EB",
          borderTopColor: "#6366F1",
          borderRadius: "50%",
          animation: "app-loading-spin 0.8s linear infinite",
        }}
      />
      <p
        style={{
          marginTop: "16px",
          fontSize: "13px",
          color: "#9CA3AF",
          fontWeight: 500,
        }}
      >
        Loading...
      </p>
      <style>{`
        @keyframes app-loading-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
