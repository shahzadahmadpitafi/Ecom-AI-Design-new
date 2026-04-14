import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { adminGet } from "@/lib/admin-api";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLocation("/admin/login");
      return;
    }
    adminGet("/auth/me")
      .then(() => { setAuthed(true); })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setLocation("/admin/login");
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;
  return <>{children}</>;
}
