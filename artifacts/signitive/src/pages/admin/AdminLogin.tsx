import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminPost } from "@/lib/admin-api";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("admin@signitive.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setLocation("/admin");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await adminPost("/auth/login", { email, password });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.admin));
      setLocation("/admin");
    } catch (err: any) {
      setError(err.message);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      await adminPost("/auth/setup", {
        name: "Signitive Admin",
        email: "admin@signitive.com",
        password: "Admin@2025",
        setupSecret: "signitive-setup-2025",
      });
      setSetupDone(true);
      setShowSetup(false);
      setPassword("Admin@2025");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-display tracking-widest" style={{ color: "#C9A84C" }}>⚡ SIGNITIVE</span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#555" }}>Admin Portal</p>
        </div>

        {setupDone && (
          <div className="mb-4 p-3 text-xs" style={{ border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.06)", color: "#4ade80" }}>
            ✓ Admin account created. Default password: <strong>Admin@2025</strong>
          </div>
        )}

        <form onSubmit={handleLogin} className={isShaking ? "animate-shake" : ""}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#a78bfa" }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                className="w-full h-11 px-3 text-sm text-white outline-none"
                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "#a78bfa" }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
                className="w-full h-11 px-3 text-sm text-white outline-none"
                style={{ background: "#111", border: "1px solid rgba(167,139,250,0.3)" }} />
            </div>

            {error && (
              <div className="p-2 text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 font-display text-sm tracking-widest uppercase transition-all disabled:opacity-50"
              style={{ background: "#C9A84C", color: "#0a0a0a" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center space-y-2">
          {!showSetup ? (
            <button onClick={() => setShowSetup(true)} className="text-[10px] text-[#333] hover:text-[#555] transition-colors">
              First time? Set up admin account →
            </button>
          ) : (
            <div className="p-3" style={{ border: "1px solid rgba(201,168,76,0.2)", background: "rgba(201,168,76,0.04)" }}>
              <p className="text-[10px] mb-2" style={{ color: "#C9A84C" }}>Create initial admin account</p>
              <p className="text-[9px] text-[#555] mb-2">Credentials: admin@signitive.com / Admin@2025</p>
              <button onClick={handleSetup}
                className="w-full h-8 text-xs font-bold uppercase tracking-wider"
                style={{ border: "1px solid rgba(201,168,76,0.4)", color: "#C9A84C" }}>
                Create Admin Account
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-[10px] text-[#333] hover:text-[#555] transition-colors">← Back to site</a>
        </div>
      </div>
    </div>
  );
}
