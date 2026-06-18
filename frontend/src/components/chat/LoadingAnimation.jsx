import { useState, useEffect } from "react";

export function LoadingAnimation({ type, meta = {} }) {
  if (type === "document") return <DocumentLoading filename={meta.filename} />;
  if (type === "skill") return <SkillLoading skill={meta.skill} />;
  if (type === "rag") return <RagLoading />;
  if (type === "thinking") return <ThinkingLoading />;
  return <ChatLoading />;
}

function DocumentLoading({ filename }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Menulis kode Python...",
    "Menyiapkan dokumen...",
    "Memformat halaman...",
    "Finalisasi file...",
  ];

  useEffect(() => {
    const interval = setInterval(() => setStep((p) => (p + 1) % steps.length), 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="load-card load-document">
      <div className="load-book">
        <div className="book">
          <div className="book-cover" />
          <div className="book-page bp-1" />
          <div className="book-page bp-2" />
          <div className="book-page bp-3" />
        </div>
      </div>
      <div className="load-text">
        <span className="load-label">Membuat dokumen</span>
        {filename && <span className="load-filename">{filename}</span>}
        <span className="load-step">{steps[step]}</span>
      </div>
      <div className="load-progress">
        <div className="load-progress-bar" />
      </div>
    </div>
  );
}

function SkillLoading({ skill }) {
  return (
    <div className="load-card load-skill">
      <div className="skill-anim-wrap">
        <div className="skill-ripple sr-1" />
        <div className="skill-ripple sr-2" />
        <div className="skill-ripple sr-3" />
        <div className="skill-icon-center">{skill?.icon || "⚡"}</div>
      </div>
      <div className="load-text">
        <span className="load-label">Menggunakan skill</span>
        <span className="skill-badge">
          {skill?.icon} {skill?.name || "Active Skill"}
        </span>
        <span className="load-step">
          Membaca instruksi skill
          <span className="load-dots">
            <span /><span /><span />
          </span>
        </span>
      </div>
    </div>
  );
}

function RagLoading() {
  const [scanLine, setScanLine] = useState(0);
  const [found, setFound] = useState(0);

  useEffect(() => {
    const scan = setInterval(() => setScanLine((p) => (p + 1) % 8), 200);
    const counter = setInterval(() => setFound((p) => (p < 5 ? p + 1 : p)), 600);
    return () => { clearInterval(scan); clearInterval(counter); };
  }, []);

  return (
    <div className="load-card load-rag">
      <div className="rag-scan-wrap">
        <div className="rag-doc-lines">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`rag-line ${i === scanLine ? "scanning" : ""} ${i < scanLine ? "scanned" : ""}`}
            />
          ))}
        </div>
        <div className="rag-scan-beam" style={{ top: `${(scanLine / 8) * 100}%` }} />
        <div className="rag-magnifier">🔍</div>
      </div>
      <div className="load-text">
        <span className="load-label">Menganalisis dokumen</span>
        <span className="load-step">
          {found > 0
            ? `Menemukan ${found} bagian relevan...`
            : "Mencari konteks yang relevan..."}
        </span>
        {found > 0 && (
          <div className="rag-found-badges">
            {[...Array(found)].map((_, i) => (
              <span key={i} className="rag-found-badge">📄 Sumber {i + 1}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingLoading() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDots((p) => (p + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="load-card load-thinking">
      <div className="thinking-brain">
        <span className="brain-icon">🧠</span>
        <div className="brain-waves">
          <div className="wave w1" />
          <div className="wave w2" />
          <div className="wave w3" />
          <div className="wave w4" />
        </div>
      </div>
      <div className="load-text">
        <span className="load-label">Berpikir mendalam</span>
        <span className="load-step">{"Menganalisis" + ".".repeat(dots)}</span>
      </div>
    </div>
  );
}

function ChatLoading() {
  return (
    <div className="load-chat">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

export function getLoadingType(ctx) {
  const { isDocumentRequest, activeSkill, ragEnabled, extendedThinking } = ctx;
  if (isDocumentRequest)
    return { type: "document", meta: { filename: guessFilename(ctx.prompt) } };
  if (activeSkill)
    return { type: "skill", meta: { skill: activeSkill } };
  if (ragEnabled)
    return { type: "rag", meta: {} };
  if (extendedThinking)
    return { type: "thinking", meta: {} };
  return { type: "chat", meta: {} };
}

function guessFilename(prompt) {
  const p = (prompt || "").toLowerCase();
  if (p.includes("absensi")) return "absensi.pdf";
  if (p.includes("laporan")) return "laporan.pdf";
  if (p.includes("excel") || p.includes("tabel")) return "data.xlsx";
  if (p.includes("word")) return "dokumen.docx";
  return "dokumen.pdf";
}
