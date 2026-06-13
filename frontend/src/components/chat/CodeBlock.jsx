import { useState } from "react";
import { Copy, Check, FileCode } from "lucide-react";
import { toast } from "sonner";

export const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.content);
    } catch {
      // Clipboard may be unavailable in some browsers — still show feedback
    }
    setCopied(true);
    toast("Copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      data-testid="code-block"
      className="ma-fade-in mt-4 overflow-hidden rounded-2xl border border-[#1F2430] bg-[#0E1117] shadow-[0_8px_24px_rgba(17,24,39,0.12)]"
    >
      <div className="flex items-center justify-between border-b border-[#1F2430] px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#9CA3AF]">
          <FileCode size={14} strokeWidth={1.75} />
          {code.filename}
        </span>
        <button
          type="button"
          data-testid="copy-code-button"
          aria-label="Copy code"
          onClick={handleCopy}
          className="ma-focus inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#9CA3AF] transition-colors duration-150 ease-out hover:bg-[#1A1F2B] hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} strokeWidth={2.25} className="text-[#34D399]" />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={1.75} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="ma-code-scroll max-h-[340px] overflow-auto p-4 text-[12.5px] leading-relaxed text-[#C9D1D9]">
        <code>{code.content}</code>
      </pre>
    </div>
  );
};
