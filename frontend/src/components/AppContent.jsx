import { useAuth } from "@/lib/AuthContext";
import { AppLoading } from "@/components/AppLoading";

export function AppContent({ children }) {
  const { loading } = useAuth();

  // Always render children (keep BrowserRouter mounted!)
  // Show loading overlay on top during initial auth check.
  // Using a conditional return that swaps children for <AppLoading/>
  // would unmount BrowserRouter, losing all router state — this causes
  // blank white pages on mobile where the unmount/remount cycle is slower.
  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
          }}
        >
          <AppLoading />
        </div>
      )}
      <div style={{ visibility: loading ? "hidden" : "visible" }}>
        {children}
      </div>
    </>
  );
}
