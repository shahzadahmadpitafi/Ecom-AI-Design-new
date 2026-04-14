export function ScanLine({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute left-0 right-0 h-px pointer-events-none z-10 animate-scanline ${className}`}
      style={{
        background: "linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent)",
      }}
    />
  );
}
