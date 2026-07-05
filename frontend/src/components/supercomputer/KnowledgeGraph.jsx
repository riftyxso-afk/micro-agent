import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Maximize2, Minimize2 } from "lucide-react";

const COLORS = ["#60A5FA", "#D1FE17", "#C084FC", "#F59E0B", "#53C546", "#FF005B"];

export function KnowledgeGraph({ nodes, edges }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!nodes?.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const W = expanded ? 600 : rect.width;
    const H = expanded ? 400 : 200;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const particles = nodes.map((n, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0,
      vy: 0,
      r: 6 + Math.random() * 8,
      label: n.label,
      color: COLORS[i % COLORS.length],
      id: n.id,
    }));

    const edgeData = (edges || []).map((e) => ({
      a: particles.find((p) => p.id === e.source),
      b: particles.find((p) => p.id === e.target),
    })).filter((e) => e.a && e.b);

    function simulate() {
      // Repulsion
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = 200 / (dist * dist);
          particles[i].vx -= (dx / dist) * force;
          particles[i].vy -= (dy / dist) * force;
          particles[j].vx += (dx / dist) * force;
          particles[j].vy += (dy / dist) * force;
        }
      }
      // Attraction along edges
      for (const e of edgeData) {
        const dx = e.b.x - e.a.x;
        const dy = e.b.y - e.a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (dist - 80) * 0.01;
        e.a.vx += (dx / dist) * force;
        e.a.vy += (dy / dist) * force;
        e.b.vx -= (dx / dist) * force;
        e.b.vy -= (dy / dist) * force;
      }
      // Center gravity
      for (const p of particles) {
        p.vx += (W / 2 - p.x) * 0.005;
        p.vy += (H / 2 - p.y) * 0.005;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(10, Math.min(W - 10, p.x));
        p.y = Math.max(10, Math.min(H - 10, p.y));
      }
    }

    function draw() {
      simulate();
      ctx.clearRect(0, 0, W, H);

      // Draw edges
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      for (const e of edgeData) {
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      }

      // Draw nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "30";
        ctx.fill();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(p.label.length > 20 ? p.label.slice(0, 18) + ".." : p.label, p.x, p.y + p.r + 12);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [nodes, edges, expanded]);

  if (!nodes?.length) return null;

  return (
    <div className={`sc2-graph-wrap ${expanded ? "expanded" : ""}`}>
      <div className="sc2-graph-header">
        <div className="sc2-graph-title">
          <Network size={14} strokeWidth={1.75} color="#D1FE17" />
          <span>Knowledge Graph ({nodes.length} concepts)</span>
        </div>
        <button className="sc2-graph-toggle" onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 size={12} strokeWidth={1.75} /> : <Maximize2 size={12} strokeWidth={1.75} />}
        </button>
      </div>
      <canvas ref={canvasRef} className="sc2-graph-canvas" />
    </div>
  );
}
