const AutoModelMark = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 3.5c2.8 5.2 5.1 7.5 12.3 8.4-6.8 1.2-9.1 3.5-12.3 16.6C12.8 15.4 10.5 13.1 3.7 11.9 10.9 11 13.2 8.7 16 3.5Z"
      fill="url(#autoCore)"
    />
    <path
      d="M8.2 22.4c1.2 2.1 2.2 3.1 5.1 3.5-2.9.5-3.9 1.5-5.1 4.6-1.2-3.1-2.2-4.1-5.1-4.6 2.9-.4 3.9-1.4 5.1-3.5Z"
      fill="#7DD3FC"
      opacity="0.95"
    />
    <defs>
      <linearGradient id="autoCore" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7DD3FC" />
        <stop offset="0.5" stopColor="#A5B4FC" />
        <stop offset="1" stopColor="#C4B5FD" />
      </linearGradient>
    </defs>
  </svg>
);

const MODEL_ICON_SRC = {
  "claude-sonnet-4-5-1m": "/svg/claude-ai-icon.svg",
  "claude-opus-4-8": "/svg/claude-ai-icon.svg",
  "claude-opus-4.6": "/svg/claude-ai-icon.svg",
  "claude-sonnet-4-6": "/svg/claude-ai-icon.svg",
  "deepseek-v4-flash": "/svg/deepseek.svg",
  "kimi-k2.6": "/svg/kimi-icon.svg",
  "glm-5": "/svg/zai.svg",
  "flux-2-klein-4b": "/svg/flux.svg",
  "minimax-m3": "/svg/minimax-color.svg",
  "minimax-m2-5": "/svg/minimax-color.svg",
  "gemini-2-5-flash": "/svg/gemini.svg",
};

export const ModelIcon = ({ model, size = 24 }) => {
  const src = MODEL_ICON_SRC[model?.id];

  if (model?.isAuto || model?.id === "auto") {
    return (
      <span
        className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-[#050505] shadow-[0_6px_18px_rgba(99,102,241,0.28)]"
        style={{ width: size, height: size }}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(125,211,252,0.42),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(196,181,253,0.34),transparent_48%)]" />
        <AutoModelMark className="relative h-[72%] w-[72%]" />
      </span>
    );
  }

  if (src) {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-lg border border-black/5 bg-white"
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="h-[70%] w-[70%] object-contain"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: Math.max(8, Math.round(size * 0.42)),
        height: Math.max(8, Math.round(size * 0.42)),
        background: model?.color || "#A5B4FC",
        boxShadow: `0 0 0 3px ${model?.color || "#A5B4FC"}1f`,
      }}
    />
  );
};
