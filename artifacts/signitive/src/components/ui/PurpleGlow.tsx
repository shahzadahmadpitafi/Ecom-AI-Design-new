export function PurpleGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute pointer-events-none animate-float ${className}`}
      style={{
        width: 500,
        height: 300,
        background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, transparent 70%)",
      }}
    />
  );
}

export function GoldGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute pointer-events-none animate-float ${className}`}
      style={{
        width: 500,
        height: 300,
        background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)",
        animationDelay: "3s",
      }}
    />
  );
}
