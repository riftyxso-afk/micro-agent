export const Logo = ({ size = 36, className = "" }) => {
  return (
    <img
      src="/logo.svg"
      alt="MicroAgent"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
