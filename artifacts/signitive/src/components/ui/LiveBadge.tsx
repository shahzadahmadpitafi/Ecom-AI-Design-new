export function LiveBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
      style={{
        background: "rgba(167,139,250,0.10)",
        border: "1px solid rgba(167,139,250,0.30)",
        color: "#a78bfa",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-[pulse-dot_1.4s_ease-in-out_infinite]"
      />
      {children}
    </div>
  );
}
