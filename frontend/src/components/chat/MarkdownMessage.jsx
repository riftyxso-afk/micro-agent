import { Fragment, useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from "lucide-react";
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './prism-override.css';

/* ------------------------------------------------------------------ */
/*  Inline helpers                                                     */
/* ------------------------------------------------------------------ */

/** Split text by delimiters so we can wrap matches. */
function tokenize(text, patterns) {
  if (!text) return [text];
  const joined = new RegExp(`(${patterns.map((p) => p.source).join("|")})`, "g");
  const tokens = [];
  let last = 0;
  for (const match of text.matchAll(joined)) {
    if (match.index > last) tokens.push({ t: "text", v: text.slice(last, match.index) });
    const raw = match[0];
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        tokens.push({ t: "match", v: raw });
        break;
      }
    }
    last = match.index + raw.length;
  }
  if (last < text.length) tokens.push({ t: "text", v: text.slice(last) });
  return tokens;
}

const INLINE_PATTERNS = [
  /`([^`]+)`/,                                         // inline code
  /\*\*([^*]+)\*\*/,                                   // bold
  /\*([^*]+)\*/,                                       // italic
  /!\[([^\]]*)\]\(([^)]+)\)/,                           // image (must come before link)
  /\[([^\]]+)\]\(([^)]+)\)/,                            // link
  /~~([^~]+)~~/,                                       // strikethrough
  /\$([^$]+)\$/,                                       // inline math $...$
  /\\\(([\.\s\S]*?)\\\)/,                                // inline math \(...\)
];

const renderInline = (v) => {
  const tokens = tokenize(v, INLINE_PATTERNS);
  return tokens.map((tok, i) => {
    if (tok.t !== "match") return <Fragment key={i}>{tok.v}</Fragment>;

    const raw = tok.v;
    if (raw.startsWith("`") && raw.endsWith("`")) {
      return <code key={i} className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 font-mono text-[0.92em] text-[#111827]">{raw.slice(1, -1)}</code>;
    }
    if (raw.startsWith("**") && raw.endsWith("**")) return <strong key={i}>{raw.slice(2, -2)}</strong>;
    if (raw.startsWith("~~") && raw.endsWith("~~")) return <del key={i} className="text-[#9CA3AF]">{raw.slice(2, -2)}</del>;
    if (raw.startsWith("\\(") && raw.endsWith("\\)")) return <InlineMath key={i} code={raw.slice(2, -2)} />;
    if (raw.startsWith("$") && raw.endsWith("$")) return <InlineMath key={i} code={raw.slice(1, -1)} />;
    if (raw.startsWith("![")) {
      const m = raw.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (!m) return raw;
      const imgSrc = m[2].trim();
      const imgAlt = m[1] || "";
      // Try to proxy broken CDN images via Google image proxy if direct fails
      return (
        <span key={i} className="block my-3">
          <img
            src={imgSrc}
            alt={imgAlt}
            className="max-w-full rounded-xl shadow-sm"
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.dataset.tried) {
                el.dataset.tried = "1";
                // Try without query params
                const clean = imgSrc.split("?")[0];
                if (clean !== imgSrc) { el.src = clean; return; }
              }
              // Hide broken image
              el.parentElement.style.display = "none";
            }}
          />
          {imgAlt && <em className="mt-1 block text-center text-[11px] text-[#9CA3AF]">{imgAlt}</em>}
        </span>
      );
    }
    if (raw.startsWith("[")) {
      const m = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const label = m[1];
        const url = m[2];
        let host = "";
        try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
        // Numeric-only labels (citation refs like [1], [2]) — show as favicon icon only
        const isNumericRef = /^\d+$/.test(label.trim());
        if (isNumericRef && host) {
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              title={host}
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded align-middle transition-opacity hover:opacity-70">
              <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                alt={host} className="h-3.5 w-3.5 rounded-sm" loading="lazy" />
            </a>
          );
        }
        // Inside references section → full label + favicon
        // Inside body text → favicon icon only
        const isRefSection = false; // handled at block level
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-1 py-0.5 text-[0.88em] text-[#374151] no-underline transition-colors hover:bg-[#F3F4F6] hover:text-[#111111]">
            {host && (
              <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                alt="" className="h-3 w-3 shrink-0 rounded-sm" loading="lazy" />
            )}
          </a>
        );
      }
      return <Fragment key={i}>{raw}</Fragment>;
    }
    if (raw.startsWith("*") && raw.endsWith("*")) return <em key={i}>{raw.slice(1, -1)}</em>;
    return <Fragment key={i}>{raw}</Fragment>;
  });
};

/* ------------------------------------------------------------------ */
/*  Block helpers                                                      */
/* ------------------------------------------------------------------ */

const HEADING = /^(#{1,4})\s+(.+)$/;
const HR = /^(?:---|___|\*\*\*)$/;
const BLOCKQUOTE = /^>\s?(.*)$/;
const UL_ITEM = /^\s*[-*+]\s+/;
const OL_ITEM = /^\s*\d+\.\s+/;
const TASK = /^\s*[-*+]\s+\[([ xX])\]\s+/;
const TABLE = /^\|(.+)\|$/;
const MATH_BLOCK = /^\$\$$/;
const LATEX_BLOCK_START = /^\\\[$/;
const LATEX_BLOCK_END = /^\\\]$/;

const MOJIBAKE_REPLACEMENTS = [
  [/Â²/g, "²"],
  [/Â³/g, "³"],
  [/Â¹/g, "¹"],
  [/Â°/g, "°"],
  [/Ã—/g, "×"],
  [/Ã·/g, "÷"],
  [/âˆ’/g, "−"],
  [/â‰ /g, "≠"],
  [/â‰¤/g, "≤"],
  [/â‰¥/g, "≥"],
  [/âˆš/g, "√"],
  [/Ï€/g, "π"],
];

const normalizeText = (value) =>
  MOJIBAKE_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    String(value || "")
  );

const looksLikeFormula = (value) =>
  /[=+\-*/^²³¹×÷√≤≥≠()]/.test(value) && /\d|[a-z]/i.test(value);

/* ------------------------------------------------------------------ */
/*  KaTeX Math Rendering                                               */
/* ------------------------------------------------------------------ */

const renderKaTeX = (code, displayMode = false) => {
  try {
    const html = katex.renderToString(code, {
      displayMode,
      throwOnError: false,
      errorColor: '#EF4444',
      strict: false,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\C": "\\mathbb{C}",
        "\\Q": "\\mathbb{Q}",
      },
    });
    return html;
  } catch {
    return `<span class="text-red-500">${code}</span>`;
  }
};

const InlineMath = ({ code }) => {
  const html = useMemo(() => renderKaTeX(code, false), [code]);
  return (
    <span
      className="katex-inline mx-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const MathBlock = ({ code }) => {
  const html = useMemo(() => renderKaTeX(code, true), [code]);
  return (
    <div
      className="katex-block overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const CodeBlock = ({ language, content }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && language && Prism.languages[language]) {
      Prism.highlightElement(codeRef.current);
    }
  }, [content, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#D1D5DB] bg-transparent">
      {language && (
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
          <span className="text-xs font-medium text-[#6B7280]">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors"
            title={copied ? "Copied!" : "Copy code"}
          >
            {copied ? (
              <><Check size={14} strokeWidth={2} /> Copied!</>
            ) : (
              <><Copy size={14} strokeWidth={1.5} /> Copy</>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 bg-[#FAFAFA] dark:bg-[#1E1E1E]">
        <code ref={codeRef} className={`language-${language || 'text'} text-sm leading-relaxed block`}>
          {content}
        </code>
      </pre>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  MarkdownMessage main                                               */
/* ------------------------------------------------------------------ */

// Detect if a heading/section is a references section
const isRefHeading = (content = "") =>
  /^(referensi|references|sumber|sources|daftar\s+sumber|daftar\s+pustaka)/i.test(content.trim());

// Collapsible references section
const ReferencesSection = ({ blocks }) => {
  const [open, setOpen] = useState(false);
  const count = blocks.filter(b => b.type === "ul" || b.type === "ol").reduce((acc, b) => acc + b.items.length, 0)
    || blocks.filter(b => b.type === "p" && b.content?.trim()).length;
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5E7EB]">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between bg-[#F9FAFB] px-4 py-2.5 text-left hover:bg-[#F3F4F6] transition-colors">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#374151]">
          <ExternalLink size={13} strokeWidth={1.75} className="text-[#9CA3AF]" />
          Referensi{count > 0 ? ` (${count})` : ""}
        </span>
        {open ? <ChevronUp size={13} className="text-[#9CA3AF]" /> : <ChevronDown size={13} className="text-[#9CA3AF]" />}
      </button>
      {open && (
        <div className="divide-y divide-[#F3F4F6] px-4 py-3 space-y-1">
          {blocks.slice(1).map((block, idx) => {
            if (block.type === "ul" || block.type === "ol") {
              return block.items.map((item, i) => (
                <RefItem key={`${idx}-${i}`} content={item} />
              ));
            }
            if (block.type === "p" && block.content?.trim()) {
              return <RefItem key={idx} content={block.content} />;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

const RefItem = ({ content }) => {
  // Extract [label](url) from content
  const m = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (m) {
    const label = m[1];
    const url = m[2];
    let host = "";
    try { host = new URL(url).hostname.replace(/^www\./, ""); } catch {}
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 py-1.5 text-[13px] text-[#374151] hover:text-[#1D4ED8] transition-colors">
        {host && (
          <img src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
            alt="" className="h-3.5 w-3.5 shrink-0 rounded-sm" loading="lazy" />
        )}
        <span className="flex-1 truncate">{label}</span>
        <ExternalLink size={11} strokeWidth={1.75} className="shrink-0 text-[#D1D5DB]" />
      </a>
    );
  }
  return <p className="py-1 text-[13px] text-[#6B7280]">{content}</p>;
};

export const MarkdownMessage = ({ text = "" }) => {
  const lines = normalizeText(text).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  let inTable = null;

  const flushParagraph = () => {
    if (blocks.length > 0 && blocks[blocks.length - 1].type === "p") return;
    blocks.push({ type: "p", content: "" });
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    /* ---- blank line ---- */
    if (!trimmed) { i += 1; inTable = null; continue; }

    /* ---- code fence ---- */
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      const content = codeLines.join("\n");
      blocks.push({
        type: language === "text" && looksLikeFormula(content) ? "math" : "code",
        language,
        content,
      });
      continue;
    }

    /* ---- math block $$ or \[ \] ---- */
    if (MATH_BLOCK.test(trimmed) || LATEX_BLOCK_START.test(trimmed)) {
      const mathLines = [];
      const endPattern = MATH_BLOCK.test(trimmed) ? MATH_BLOCK : LATEX_BLOCK_END;
      i += 1;
      while (i < lines.length && !endPattern.test(lines[i].trim())) {
        mathLines.push(lines[i].trim());
        i += 1;
      }
      i += 1;
      blocks.push({ type: "math", content: mathLines.join(" ") });
      continue;
    }

    /* ---- single-line LaTeX display: \[ ... \] ---- */
    if (trimmed.startsWith("\\[") && trimmed.endsWith("\\]")) {
      blocks.push({ type: "math", content: trimmed.slice(2, -2).trim() });
      i += 1;
      continue;
    }

    /* ---- heading ---- */
    const hMatch = line.match(HEADING);
    if (hMatch) { blocks.push({ type: "heading", level: hMatch[1].length, content: hMatch[2] }); i += 1; continue; }

    /* ---- hr ---- */
    if (HR.test(trimmed)) { blocks.push({ type: "hr" }); i += 1; continue; }

    /* ---- blockquote ---- */
    const bqMatch = line.match(BLOCKQUOTE);
    if (bqMatch) {
      const items = [bqMatch[1]];
      i += 1;
      while (i < lines.length && BLOCKQUOTE.test(lines[i])) {
        items.push(lines[i].match(BLOCKQUOTE)[1]);
        i += 1;
      }
      blocks.push({ type: "blockquote", content: items.join("\n") });
      continue;
    }

    /* ---- task list ---- */
    if (TASK.test(line)) {
      const items = [];
      while (i < lines.length && TASK.test(lines[i])) {
        const m = lines[i].match(TASK);
        items.push({ checked: m[1] !== " ", content: lines[i].replace(TASK, "") });
        i += 1;
      }
      blocks.push({ type: "task", items });
      continue;
    }

    /* ---- unordered list ---- */
    if (UL_ITEM.test(line)) {
      const items = [];
      while (i < lines.length && UL_ITEM.test(lines[i])) {
        items.push(lines[i].replace(UL_ITEM, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    /* ---- ordered list ---- */
    if (OL_ITEM.test(line)) {
      const items = [];
      while (i < lines.length && OL_ITEM.test(lines[i])) {
        items.push(lines[i].replace(OL_ITEM, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    /* ---- table ---- */
    const tMatch = line.match(TABLE);
    if (tMatch && !inTable) {
      inTable = [];
      const headers = tMatch[1].split("|").map((c) => ({ text: c.trim(), align: "left" }));
      i += 1;
      // skip separator row
      if (i < lines.length && /^\|[-| :]+\|$/.test(lines[i].trim())) {
        const sepParts = lines[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        sepParts.forEach((part, idx) => {
          if (headers[idx]) {
            if (part.startsWith(":") && part.endsWith(":")) headers[idx].align = "center";
            else if (part.endsWith(":")) headers[idx].align = "right";
          }
        });
        i += 1;
      }
      const rows = [];
      while (i < lines.length && TABLE.test(lines[i].trim())) {
        const row = lines[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        rows.push(row);
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      inTable = null;
      continue;
    }

    /* ---- ordinary paragraph ---- */
    const paraLines = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !MATH_BLOCK.test(lines[i].trim()) &&
      !LATEX_BLOCK_START.test(lines[i].trim()) &&
      !LATEX_BLOCK_END.test(lines[i].trim()) &&
      !lines[i].trim().match(/^\\\[.*\\\]$/) &&
      !HEADING.test(lines[i]) &&
      !HR.test(lines[i].trim()) &&
      !BLOCKQUOTE.test(lines[i]) &&
      !TASK.test(lines[i]) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i]) &&
      !TABLE.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "p", content: paraLines.join(" ") });
  }

  // Split blocks into main content and references section
  let refStart = -1;
  for (let idx = 0; idx < blocks.length; idx++) {
    if (blocks[idx].type === "heading" && isRefHeading(blocks[idx].content)) {
      refStart = idx;
      break;
    }
  }
  const mainBlocks = refStart >= 0 ? blocks.slice(0, refStart) : blocks;
  const refBlocks = refStart >= 0 ? blocks.slice(refStart) : [];

  const renderBlock = (block, index) => {
    switch (block.type) {
          case "code":
            return <CodeBlock key={index} language={block.language} content={block.content} />;

          case "math":
            return <MathBlock key={index} code={block.content} />;

          case "heading": {
            const cls = block.level === 1 ? "text-xl font-semibold tracking-[-0.02em] text-[#111111]" :
                         block.level === 2 ? "text-lg font-semibold tracking-[-0.01em] text-[#111111]" :
                         block.level === 3 ? "text-base font-semibold text-[#111111]" :
                                             "text-sm font-semibold text-[#111111]";
            return <div key={index} className={cls}>{renderInline(block.content)}</div>;
          }

          case "hr":
            return <hr key={index} className="border-t border-[#E5E7EB]" />;

          case "blockquote":
            return (
              <blockquote key={index} className="border-l-4 border-[#D1D5DB] pl-4 italic text-[#6B7280]">
                {renderInline(block.content)}
              </blockquote>
            );

          case "task":
            return (
              <ul key={index} className="space-y-1.5 pl-1">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded border border-[#D1D5DB] text-[10px]">
                      {item.checked ? "✓" : ""}
                    </span>
                    <span>{renderInline(item.content)}</span>
                  </li>
                ))}
              </ul>
            );

          case "ul":
            return (
              <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-[#9CA3AF]">
                {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
              </ul>
            );

          case "ol":
            return (
              <ol key={index} className="list-decimal space-y-1.5 pl-5 marker:text-[#9CA3AF]">
                {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
              </ol>
            );

          case "table":
            return (
              <div key={index} className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#FAFAFA]">
                      {block.headers.map((h, hIndex) => (
                        <th key={hIndex} className={`border-r border-[#E5E7EB] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#6B7280] text-${h.align}`}>{h.text}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIndex) => (
                      <tr key={rIndex} className="border-t border-[#E5E7EB] last:border-0">
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className={`border-r border-[#E5E7EB] px-4 py-2.5 text-[#1F2937] text-${block.headers[cIndex]?.align || "left"}`}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return <p key={index}>{renderInline(block.content)}</p>;
        }
  };

  return (
    <div className="space-y-4 text-[15px] leading-[1.75] text-[#1F2937]">
      {/* KaTeX global styles — scoped to our container */}
      <style>{`
        .katex-inline .katex { font-size: 1.05em; }
        .katex-block .katex { font-size: 1.15em; }
        .katex-block .katex-display { margin: 0.25em 0; }
        .katex .base { margin: 0 0.05em; }
      `}</style>

      {/* Main content */}
      {mainBlocks.map((block, index) => renderBlock(block, index))}

      {/* References section — collapsible */}
      {refBlocks.length > 0 && (
        <ReferencesSection blocks={refBlocks} />
      )}
    </div>
  );
};
