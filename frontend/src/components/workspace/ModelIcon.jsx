const OpenAI = (props) => (
  <svg {...props} preserveAspectRatio="xMidYMid" viewBox="0 0 256 260">
    <path
      fill="currentColor"
      d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z"
    />
  </svg>
);

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

const MODEL_ICON_KIND = {
  "gpt-5-5": "openai",
};

const MODEL_ICON_SRC = {
  "claude-haiku-4-5": "/svg/claude-ai-icon.svg",
  "gemini-2-5-flash-lite": "/svg/gemini.svg",
  "gemini-3-1-pro": "/svg/gemini.svg",
  "kimi-k2-6": "/svg/kimi-icon.svg",
  "deepseek-v4-pro": "/svg/deepseek.svg",
};

export const ModelIcon = ({ model, size = 24 }) => {
  const kind = MODEL_ICON_KIND[model?.id];
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

  if (kind === "openai") {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-lg bg-[#10A37F] text-white"
        style={{ width: size, height: size }}
      >
        <OpenAI className="h-[58%] w-[58%]" />
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
