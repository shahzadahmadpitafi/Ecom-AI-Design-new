const getToken = () => localStorage.getItem("admin_token") || "";

export async function adminFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const res = await fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const adminGet  = (path: string)                       => adminFetch(path, { method: "GET" });
export const adminPost = (path: string, body: any)            => adminFetch(path, { method: "POST", body: JSON.stringify(body) });
export const adminPut  = (path: string, body: any)            => adminFetch(path, { method: "PUT",  body: JSON.stringify(body) });
export const adminDel  = (path: string)                       => adminFetch(path, { method: "DELETE" });

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:      { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24",  border: "rgba(251,191,36,0.3)" },
  confirmed:    { bg: "rgba(59,130,246,0.1)",  text: "#60a5fa",  border: "rgba(59,130,246,0.3)" },
  sampling:     { bg: "rgba(167,139,250,0.1)", text: "#a78bfa",  border: "rgba(167,139,250,0.3)" },
  in_production:{ bg: "rgba(167,139,250,0.15)",text: "#c4b5fd",  border: "rgba(167,139,250,0.4)" },
  quality_check:{ bg: "rgba(34,211,238,0.1)",  text: "#22d3ee",  border: "rgba(34,211,238,0.3)" },
  shipped:      { bg: "rgba(34,211,238,0.15)", text: "#67e8f9",  border: "rgba(34,211,238,0.4)" },
  delivered:    { bg: "rgba(34,197,94,0.1)",   text: "#4ade80",  border: "rgba(34,197,94,0.3)" },
  cancelled:    { bg: "rgba(239,68,68,0.1)",   text: "#f87171",  border: "rgba(239,68,68,0.3)" },
};

export const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  unpaid:  { bg: "rgba(239,68,68,0.1)",   text: "#f87171", border: "rgba(239,68,68,0.3)" },
  partial: { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)" },
  paid:    { bg: "rgba(34,197,94,0.1)",   text: "#4ade80", border: "rgba(34,197,94,0.3)" },
};

export function StatusBadge({ status, type = "order" }: { status: string; type?: "order" | "payment" }) {
  const palette = type === "payment" ? PAYMENT_STATUS_COLORS : STATUS_COLORS;
  const c = palette[status] || { bg: "rgba(160,160,160,0.1)", text: "#a0a0a0", border: "rgba(160,160,160,0.2)" };
  return {
    style: { background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const },
    label: status.replace(/_/g, " "),
  };
}

export function formatPKR(amount: number | null | undefined): string {
  if (amount == null) return "PKR 0";
  return `PKR ${Math.round(amount).toLocaleString()}`;
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
}
