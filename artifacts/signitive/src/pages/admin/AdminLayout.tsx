import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminGet, adminPost } from "@/lib/admin-api";
import {
  LayoutDashboard, Package, Users, Palette, CreditCard, Factory, BarChart3,
  Settings, Bell, LogOut, Menu, X, ChevronRight, Zap, ShoppingBag,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin",             label: "Dashboard",  Icon: LayoutDashboard },
  { path: "/admin/orders",      label: "Orders",     Icon: Package          },
  { path: "/admin/customers",   label: "Customers",  Icon: Users            },
  { path: "/admin/products",    label: "Products",   Icon: ShoppingBag      },
  { path: "/admin/production",  label: "Production", Icon: Factory          },
  { path: "/admin/payments",    label: "Payments",   Icon: CreditCard       },
  { path: "/admin/analytics",   label: "Analytics",  Icon: BarChart3        },
  { path: "/admin/settings",    label: "Settings",   Icon: Settings         },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin]             = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) setAdmin(JSON.parse(stored));
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await adminGet("/notifications");
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    } catch {}
  };

  const markAllRead = async () => {
    await adminPost("/notifications/read-all", {});
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    try { await adminPost("/auth/logout", {}); } catch {}
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setLocation("/admin/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location === "/admin";
    return location.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: "#C9A84C" }} />
          <span className="font-display text-base tracking-widest" style={{ color: "#C9A84C" }}>SIGNITIVE</span>
        </div>
        <p className="text-[9px] uppercase tracking-[0.3em] mt-0.5" style={{ color: "#333" }}>Admin Control Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = isActive(path);
          return (
            <button key={path} onClick={() => { setLocation(path); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
              style={{
                color: active ? "#C9A84C" : "#555",
                borderLeft: `2px solid ${active ? "#C9A84C" : "transparent"}`,
                background: active ? "rgba(201,168,76,0.05)" : "transparent",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#555"; }}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs uppercase tracking-[0.1em]">{label}</span>
              {active && <ChevronRight className="h-3 w-3 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(167,139,250,0.1)" }}>
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] font-bold text-white truncate">{admin?.name || "Admin"}</p>
          <p className="text-[9px] truncate" style={{ color: "#555" }}>{admin?.email}</p>
        </div>
        <button onClick={() => setLocation("/")}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs uppercase tracking-wider text-[#444] hover:text-[#888] transition-colors">
          <Settings className="h-4 w-4" /> View Site
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-xs uppercase tracking-wider text-[#444] hover:text-red-400 transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0 flex-col" style={{ background: "#080808", borderRight: "1px solid rgba(167,139,250,0.15)" }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 flex flex-col" style={{ background: "#080808", borderRight: "1px solid rgba(167,139,250,0.15)" }}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-[#555] hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 h-14"
          style={{ background: "#080808", borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#555] hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg tracking-widest uppercase" style={{ color: "#a78bfa" }}>{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)}
                className="relative p-1.5 text-[#555] hover:text-[#C9A84C] transition-colors">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                    style={{ background: "#ef4444", color: "white" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50 overflow-hidden"
                  style={{ background: "#111", border: "1px solid rgba(167,139,250,0.2)" }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
                    <span className="text-[10px] uppercase tracking-widest text-white font-bold">Notifications</span>
                    <button onClick={markAllRead} className="text-[9px] text-[#a78bfa] uppercase tracking-wider">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 8).map(n => (
                      <div key={n.id} className="px-4 py-3 transition-colors"
                        style={{ borderBottom: "1px solid rgba(167,139,250,0.07)", background: n.isRead ? "transparent" : "rgba(167,139,250,0.04)" }}>
                        <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                        <p className="text-[10px] text-[#555] mt-0.5">{n.message}</p>
                        <p className="text-[9px] mt-1" style={{ color: "#333" }}>{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="px-4 py-3 text-xs text-[#555]">No notifications</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid rgba(167,139,250,0.1)" }}>
              <div className="w-7 h-7 flex items-center justify-center font-bold text-xs" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
                {admin?.name?.[0] || "A"}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-white leading-none">{admin?.name}</p>
                <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#a78bfa" }}>{admin?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
