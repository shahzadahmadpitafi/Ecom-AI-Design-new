export function GoldDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
      <span
        className="text-[9px] uppercase tracking-[0.25em] shrink-0"
        style={{ color: "#a78bfa" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.2)" }} />
    </div>
  );
}
