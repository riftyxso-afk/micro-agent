export const Logo = ({ size = 36, className = "" }) => {
  return (
    <div
      className={`ma-logo-mark grid place-items-center ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.32 }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract AI mark: orbiting spark */}
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="32 22"
          transform="rotate(-45 12 12)"
        />
        <circle cx="12" cy="12" r="3.2" fill="#FFFFFF" />
        <circle cx="18.6" cy="5.6" r="1.6" fill="rgba(255,255,255,0.9)" />
      </svg>
    </div>
  );
};
