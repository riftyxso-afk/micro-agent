import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSubscription } from "@/lib/useSubscription";

export default function SupercomputerRunPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isPro, loading } = useSubscription();
  const task = params.get("task") || "";
  const mode = params.get("mode") || "efficient";
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!loading && !isPro) navigate("/pricing", { replace: true });
  }, [loading, isPro, navigate]);

  useEffect(() => {
    if (!task || loading || !isPro) return;
    const run = async () => {
      try {
        const res = await fetch("/api/supercomputer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: task, mode }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || `HTTP ${res.status}`);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done: d, value } = await reader.read();
          if (d) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.type === "step") setSteps((p) => [...p, data]);
              if (data.type === "complete") { setResult(data); setDone(true); }
              if (data.type === "error") { setError(data.error); setDone(true); }
            } catch (e) { /* skip */ }
          }
        }
      } catch (err) {
        setError(err.message);
        setDone(true);
      }
    };
    run();
  }, [task, mode, loading, isPro]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  if (loading) return <div className="min-h-dvh sc2-run-page" />;
  if (!isPro) return null;

  return (
    <div className="sc2-run-page">
      {/* Header */}
      <div className="sc2-run-header">
        <button onClick={() => navigate("/supercomputer")} className="sc2-back">
          ← Supercomputer
        </button>
        <div className="sc2-run-task-label">
          <span className="sc2-run-icon">🖥️</span>
          <span>{task.slice(0, 60)}{task.length > 60 ? "..." : ""}</span>
        </div>
        {error ? (
          <div className="sc2-run-status error">❌ Error</div>
        ) : !done ? (
          <div className="sc2-run-status">Running...</div>
        ) : (
          <div className="sc2-run-status done">✅ Complete</div>
        )}
      </div>

      {/* Body */}
      <div className="sc2-run-body">
        {error && (
          <div className="sc2-run-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="sc2-run-steps">
          {steps.map((step, i) => (
            <div key={i} className={`sc2-run-step type-${step.step_type || "info"}`}>
              <div className="sc2-run-step-dot" />
              <span className="sc2-run-step-msg">{step.message}</span>
            </div>
          ))}
          {!done && !error && (
            <div className="sc2-run-step type-loading">
              <div className="sc2-run-spinner" />
              <span>Working...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {result && (
          <div className="sc2-run-result">
            <h3>Result</h3>
            <div className="sc2-run-result-body">
              {result.response || result.report || ""}
            </div>
            {result.download_url && (
              <a href={result.download_url} download className="sc2-run-download">
                ⬇️ Download {result.filename}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
