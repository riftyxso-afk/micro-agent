import { motion, AnimatePresence } from "framer-motion";
import { Search, Code, CheckCircle2, Loader2, ChevronDown, ChevronUp, Brain, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const AGENT_META = {
  researcher: { icon: Search, color: "#60A5FA", label: "Researcher" },
  executor: { icon: Code, color: "#D1FE17", label: "Executor" },
  reviewer: { icon: Brain, color: "#C084FC", label: "Reviewer" },
  system: { icon: Zap, color: "#F59E0B", label: "System" },
};

export function AgentCard({ agentId, steps, output, done, delta }) {
  const [expanded, setExpanded] = useState(done || !!output);
  useEffect(() => {
    if (done || output) setExpanded(true);
  }, [done, output]);

  const meta = AGENT_META[agentId] || { icon: Zap, color: "#898A8B", label: agentId };
  const Icon = meta.icon;
  const agentSteps = steps.filter((s) => s.agent_id === agentId);

  return (
    <div className="sc2-agent-card">
      <div className="sc2-agent-header">
        <div className="sc2-agent-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
          <Icon size={16} strokeWidth={1.75} />
        </div>
        <div className="sc2-agent-info">
          <span className="sc2-agent-name">{meta.label}</span>
          <span className="sc2-agent-status">
            {done ? (
              <span style={{ color: "#53C546" }}>
                <CheckCircle2 size={12} strokeWidth={1.75} /> Complete
              </span>
            ) : output || delta ? (
              <span style={{ color: meta.color }}>
                <Loader2 size={12} strokeWidth={1.75} className="sc2-spin-icon" /> Processing...
              </span>
            ) : (
              <span style={{ color: "#898A8B" }}>Waiting</span>
            )}
          </span>
        </div>
        <button className="sc2-agent-expand" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={14} strokeWidth={1.75} /> : <ChevronDown size={14} strokeWidth={1.75} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sc2-agent-body"
          >
            {agentSteps.map((step, i) => (
              <div key={i} className={`sc2-agent-step type-${step.step_type || "info"}`}>
                <div className="sc2-agent-step-dot" />
                <span className="sc2-agent-step-msg">{step.message}</span>
              </div>
            ))}
            {(output || delta) && (
              <div className="sc2-agent-output">
                <pre className="sc2-agent-pre">
                  {delta || output || ""}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
