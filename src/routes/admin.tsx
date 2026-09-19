import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Lock,
  User,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Copy,
  Check,
  Send,
  Sliders,
  LogOut,
  Gamepad2,
  ExternalLink,
  ChevronDown,
  Settings,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  adminGetAllOrdersFn,
  adminUpdateOrderStatusFn,
  adminGetAllGamesFn,
  adminSaveGameFn,
  adminDeleteGameFn,
  adminSavePackageFn,
  adminDeletePackageFn,
  getSiteSettingsFn,
  updateSiteSettingsFn,
} from "@/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal — SKz Lab Top-Up Management" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, adminLogin, adminLogout } = useAuth();

  // Admin login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab (Dashboard first)
  const [tab, setTab] = useState<"dashboard" | "orders" | "games" | "settings">("dashboard");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderNoteInput, setOrderNoteInput] = useState<{ [id: string]: string }>({});

  // Games State
  const [games, setGames] = useState<any[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [selectedGameForPackage, setSelectedGameForPackage] = useState<any | null>(null);

  // Game Modal / Form
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any | null>(null);
  const [gameForm, setGameForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    image: "",
    badge: "",
    category: "battle-royale",
    order_time: "",
    description: "",
    needsUserId: true,
    needsServerId: false,
    needsEmail: false,
  });

  // Package Form
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState({
    dbId: undefined as number | undefined,
    game_id: 0,
    package_id: "",
    name: "",
    price: 0,
    popular: false,
  });

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    bkash_number: "",
    nagad_number: "",
    rocket_number: "",
    support_whatsapp: "",
    notice: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Custom Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "game" | "package";
    id: number;
    title: string;
    name: string;
    subText?: string;
  }>({
    isOpen: false,
    type: "game",
    id: 0,
    title: "",
    name: "",
  });

  // Copy tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadOrders();
      loadGames();
      loadSettings();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const res = await adminLogin(username, password);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || "Access Denied: Invalid Admin Credentials");
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await adminGetAllOrdersFn({
        data: {
          status: orderStatusFilter,
          search: orderSearch,
        },
      });
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadGames = async () => {
    setLoadingGames(true);
    try {
      const data = await adminGetAllGamesFn();
      setGames(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGames(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await getSiteSettingsFn();
      if (data) setSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: "pending" | "processing" | "completed" | "cancelled"
  ) => {
    setUpdatingOrderId(orderId);
    const notes = orderNoteInput[orderId];
    try {
      const res = await adminUpdateOrderStatusFn({
        data: { orderId, status: newStatus, adminNotes: notes },
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus, admin_notes: notes || o.admin_notes } : o))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    const needs: any[] = [];
    if (gameForm.needsUserId) needs.push({ label: "Player ID", placeholder: "Enter Player ID", key: "userId" });
    if (gameForm.needsServerId) needs.push({ label: "Server ID", placeholder: "Enter Server ID", key: "serverId" });
    if (gameForm.needsEmail) needs.push({ label: "Email Address", placeholder: "your@email.com", key: "email" });

    try {
      await adminSaveGameFn({
        data: {
          id: editingGame?.id,
          slug: gameForm.slug.toLowerCase().trim(),
          name: gameForm.name,
          tagline: gameForm.tagline,
          image: gameForm.image,
          badge: gameForm.badge || undefined,
          category: gameForm.category,
          order_time: gameForm.order_time,
          description: gameForm.description,
          needs,
        },
      });
      setShowGameModal(false);
      setEditingGame(null);
      loadGames();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGame = (game: any) => {
    setDeleteConfirm({
      isOpen: true,
      type: "game",
      id: game.id,
      title: "Delete Game?",
      name: game.name,
      subText: "Are you sure you want to delete this game and all of its packages? This action cannot be undone.",
    });
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminSavePackageFn({
        data: {
          dbId: packageForm.dbId,
          game_id: packageForm.game_id,
          package_id: packageForm.package_id,
          name: packageForm.name,
          price: Number(packageForm.price),
          popular: packageForm.popular,
        },
      });
      setShowPackageModal(false);
      loadGames();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePackage = (pkg: any) => {
    setDeleteConfirm({
      isOpen: true,
      type: "package",
      id: pkg.dbId,
      title: "Delete Package?",
      name: pkg.name,
      subText: `Are you sure you want to delete the package "${pkg.name}"?`,
    });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm.id) return;
    try {
      if (deleteConfirm.type === "game") {
        await adminDeleteGameFn({ data: { id: deleteConfirm.id } });
      } else {
        await adminDeletePackageFn({ data: { id: deleteConfirm.id } });
      }
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      loadGames();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await updateSiteSettingsFn({ data: { settings } });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ================= ADMIN LOGIN SCREEN =================
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 shadow-lg shadow-red-600/30">
              <ShieldAlert className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-black tracking-tight text-white uppercase">
              Admin <span className="text-red-500">Security Gate</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Authorized personnel only. Credentials verified against server environment.
            </p>
          </div>

          {loginError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Username</label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Password</label>
                <span className="text-[10px] text-slate-500 font-mono">From .env</span>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin@SKzLab2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-3 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {loginLoading ? "Authenticating..." : "Unlock Control Panel"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ================= AUTHENTICATED ADMIN PANEL =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-black shadow-lg shadow-red-600/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-wider uppercase text-white">
                SKz<span className="text-red-500">ADMIN</span>
              </span>
              <span className="ml-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Live Server
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Public Site
            </a>
            <button
              onClick={adminLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-800/80 bg-slate-900/60 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl flex gap-4 sm:gap-6 text-sm font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setTab("dashboard")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                tab === "dashboard"
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                tab === "orders" ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" /> Orders Management ({orders.length})
            </button>
            <button
              onClick={() => setTab("games")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                tab === "games" ? "border-red-500 text-red-400" : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4 w-4" /> Games & Coins CMS ({games.length})
            </button>
            <button
              onClick={() => setTab("settings")}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                tab === "settings"
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" /> MFS & System Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        {/* ================= TAB 0: DASHBOARD ================= */}
        {tab === "dashboard" && (
          <div className="space-y-8">
            {/* Greeting & Quick Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                  Executive <span className="text-red-500">Dashboard</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Real-time sales performance, pending verifications, and platform health
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    loadOrders();
                    loadGames();
                    loadSettings();
                  }}
                  disabled={loadingOrders || loadingGames}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders || loadingGames ? "animate-spin" : ""}`} />
                  Sync Live Data
                </button>
              </div>
            </div>

            {/* 4 KPI METRICS BOXES (CLICKABLE TO ORDERS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Total Orders */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => {
                  setOrderStatusFilter("all");
                  setTab("orders");
                }}
                className="cursor-pointer rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Total Orders</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-black text-white">{orders.length}</span>
                  <span className="text-xs text-slate-400">orders</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-cyan-300 transition">
                  <span>View full order history</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 2: Pending Orders */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => {
                  setOrderStatusFilter("pending");
                  setTab("orders");
                }}
                className="cursor-pointer rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-xl hover:border-amber-500/60 hover:shadow-amber-500/10 transition group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pending Orders</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
                    <Clock className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-black text-amber-400">
                    {orders.filter((o) => o.order_status === "pending").length}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20">
                    Needs Action
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-amber-300 transition">
                  <span>Verify TrxID & deliver</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 3: Completed Orders */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => {
                  setOrderStatusFilter("completed");
                  setTab("orders");
                }}
                className="cursor-pointer rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-xl hover:border-emerald-500/60 hover:shadow-emerald-500/10 transition group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Completed Orders</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-black text-emerald-400">
                    {orders.filter((o) => o.order_status === "completed").length}
                  </span>
                  <span className="text-xs text-slate-400">fulfilled</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-emerald-300 transition">
                  <span>Delivered successfully</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>

              {/* Card 4: Total Revenue */}
              <motion.div
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => {
                  setOrderStatusFilter("completed");
                  setTab("orders");
                }}
                className="cursor-pointer rounded-2xl border border-red-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 shadow-xl hover:border-red-500/60 hover:shadow-red-500/10 transition group relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">Total Sales Volume</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-110 transition">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl sm:text-4xl font-black text-white">
                    ৳{orders
                      .filter((o) => o.order_status === "completed")
                      .reduce((sum, o) => sum + (Number(o.amount) || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400 group-hover:text-red-300 transition">
                  <span>From completed top-ups</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </motion.div>
            </div>

            {/* Quick Status & Live Payment Numbers Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Gateways Status */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-red-400" />
                    <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider">
                      Active Payment & Support
                    </h3>
                  </div>
                  <button
                    onClick={() => setTab("settings")}
                    className="text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    Edit Numbers →
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-pink-400">bKash Personal</span>
                    <span className="font-mono text-white font-semibold">{settings.bkash_number || "Not Set"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-orange-400">Nagad Personal</span>
                    <span className="font-mono text-white font-semibold">{settings.nagad_number || "Not Set"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-purple-400">Rocket Personal</span>
                    <span className="font-mono text-white font-semibold">{settings.rocket_number || "Not Set"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-emerald-400">WhatsApp Support</span>
                    <span className="font-mono text-white font-semibold">{settings.support_whatsapp || "Not Set"}</span>
                  </div>
                </div>
              </div>

              {/* Games & CMS Status */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-red-400" />
                    <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider">
                      Games & Catalog
                    </h3>
                  </div>
                  <button
                    onClick={() => setTab("games")}
                    className="text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    Manage CMS →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 font-medium">Total Active Games</span>
                    <span className="font-display font-black text-lg text-white">{games.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 font-medium">Total Coin Packages</span>
                    <span className="font-display font-black text-lg text-emerald-400">
                      {games.reduce((acc, g) => acc + (g.packages?.length || 0), 0)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTab("games");
                      setEditingGame(null);
                      setGameForm({
                        name: "",
                        slug: "",
                        tagline: "",
                        image: "",
                        badge: "",
                        category: "battle-royale",
                        order_time: "",
                        description: "",
                        needsUserId: true,
                        needsServerId: false,
                        needsEmail: false,
                      });
                      setShowGameModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Game
                  </button>
                </div>
              </div>

              {/* Order Flow Quick Guide */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider">
                    Quick Operations Guide
                  </h3>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                      1
                    </span>
                    <p className="text-slate-400">
                      Check <span className="text-amber-400 font-semibold">Pending Orders</span> box to see new orders needing MFS verification.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                      2
                    </span>
                    <p className="text-slate-400">
                      Copy the customer's <span className="text-white font-semibold">Player UID</span> and send diamonds / UC via game reload system.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                      3
                    </span>
                    <p className="text-slate-400">
                      Click <span className="text-emerald-400 font-semibold">"Mark Completed"</span> to notify user and finalize transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ORDERS PREVIEW */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                    Recent Top-Up Requests
                  </h3>
                  <p className="text-xs text-slate-400">Latest orders placed across the store</p>
                </div>
                <button
                  onClick={() => {
                    setOrderStatusFilter("all");
                    setTab("orders");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition"
                >
                  View All Orders ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No orders placed yet. Orders made by customers will appear here immediately.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Game & Package</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 font-mono font-bold text-white">{order.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{order.customer_name}</div>
                            <div className="text-[11px] text-slate-400">{order.customer_phone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-red-400">{order.game_name}</div>
                            <div className="text-[11px] text-slate-300">{order.package_name}</div>
                          </td>
                          <td className="py-3 px-3 font-display font-black text-emerald-400 text-sm">
                            ৳{order.amount}
                          </td>
                          <td className="py-3 px-3">
                            <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {order.payment_method}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{order.transaction_id}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                order.order_status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : order.order_status === "processing"
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : order.order_status === "cancelled"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setOrderSearch(order.id);
                                setTab("orders");
                              }}
                              className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ================= TAB 1: ORDERS ================= */}
        {tab === "orders" && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black uppercase text-white">Top-Up Orders</h2>
                <p className="text-xs text-slate-400">Verify MFS TrxID, copy Player ID, and deliver game currency</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:border-slate-500 transition"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin text-red-400" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Phone, Player ID, Game or TrxID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadOrders()}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={loadOrders}
                  className="rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-500 transition"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div className="py-20 text-center text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-red-500 mb-2" />
                <p className="text-xs">Fetching orders from PostgreSQL database...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
                <Package className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <p className="font-display text-base font-bold text-slate-400">No orders found</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing the search filter or wait for new top-up purchases.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isUpdating = updatingOrderId === order.id;
                  const rawCreds = order.player_credentials || {};
                  const credsText = Object.entries(rawCreds)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ");
                  const primaryPlayerId = rawCreds.userId || rawCreds["Player ID"] || Object.values(rawCreds)[0] || "";

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 hover:border-slate-700 transition space-y-4"
                    >
                      {/* Top row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                            {order.id}
                          </span>
                          <span className="font-display font-black text-sm text-white">{order.game_name}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-xs font-bold text-amber-400">{order.package_name}</span>
                          <span className="font-display font-black text-sm text-emerald-400">৳{order.amount}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {new Date(order.created_at).toLocaleString("en-BD", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              order.order_status === "completed"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : order.order_status === "processing"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : order.order_status === "cancelled"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Player ID / Account info */}
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 mb-1">
                            <span>In-Game Credentials</span>
                            {primaryPlayerId && (
                              <button
                                onClick={() => copyText(String(primaryPlayerId), `pid-${order.id}`)}
                                className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold"
                              >
                                {copiedId === `pid-${order.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                                Copy ID
                              </button>
                            )}
                          </div>
                          <div className="space-y-1">
                            {Object.entries(rawCreds).map(([k, v]) => (
                              <p key={k} className="text-slate-300">
                                <span className="text-slate-500 uppercase font-semibold">{k}:</span>{" "}
                                <span className="font-mono font-bold text-white selection:bg-red-500">{String(v)}</span>
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Payment Verification */}
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 mb-1">
                            <span>Payment Details</span>
                            <button
                              onClick={() => copyText(order.transaction_id, `trx-${order.id}`)}
                              className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold"
                            >
                              {copiedId === `trx-${order.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              Copy TrxID
                            </button>
                          </div>
                          <p className="text-slate-300">
                            Method: <span className="text-red-400 font-bold uppercase">{order.payment_method}</span>
                          </p>
                          <p className="text-slate-300">
                            Sender: <span className="font-mono text-white font-semibold">{order.payment_sender_number}</span>
                          </p>
                          <p className="text-slate-300">
                            TrxID:{" "}
                            <span className="font-mono font-bold text-emerald-400 selection:bg-emerald-500 selection:text-black">
                              {order.transaction_id}
                            </span>
                          </p>
                        </div>

                        {/* Customer Contact */}
                        <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800 flex flex-col justify-between">
                          <div>
                            <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">Customer Info</p>
                            <p className="font-bold text-white">{order.customer_name}</p>
                            <p className="text-slate-400 font-mono">{order.customer_phone}</p>
                            <p className="text-slate-500 text-[11px] truncate">{order.customer_email}</p>
                          </div>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${order.customer_name}, regarding your order ${order.id} for ${order.game_name} (${order.package_name})...`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-600/30 transition"
                          >
                            <Send className="h-3 w-3" /> WhatsApp Customer
                          </a>
                        </div>
                      </div>

                      {/* Status changer & admin notes */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Add admin note (e.g. UC sent successfully, or invalid TrxID)..."
                            defaultValue={order.admin_notes || ""}
                            onChange={(e) =>
                              setOrderNoteInput({ ...orderNoteInput, [order.id]: e.target.value })
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateStatus(order.id, "processing")}
                            disabled={isUpdating}
                            className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-600/30 transition disabled:opacity-50"
                          >
                            Processing
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600/30 transition disabled:opacity-50"
                          >
                            ✓ Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                            disabled={isUpdating}
                            className="rounded-lg bg-rose-600/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-600/30 transition disabled:opacity-50"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: GAMES & COIN CMS ================= */}
        {tab === "games" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-black uppercase text-white">Games & Coin CMS</h2>
                <p className="text-xs text-slate-400">Add new games, configure player fields, and update coin prices</p>
              </div>

              <button
                onClick={() => {
                  setEditingGame(null);
                  setGameForm({
                    name: "",
                    slug: "",
                    tagline: "",
                    image: "",
                    badge: "",
                    category: "battle-royale",
                    order_time: "Instant 5-10 minutes",
                    description: "",
                    needsUserId: true,
                    needsServerId: false,
                    needsEmail: false,
                  });
                  setShowGameModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                <Plus className="h-4 w-4" /> Add New Game
              </button>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((g) => (
                <div
                  key={g.slug}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={g.image} alt={g.name} className="h-14 w-14 rounded-xl object-cover border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-sm text-white truncate">{g.name}</h3>
                        {g.badge && (
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                            {g.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-red-400 truncate">{g.tagline}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{g.category}</p>
                    </div>
                  </div>

                  {/* Coin packages list */}
                  <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-slate-400">
                        Packages ({g.packages?.length || 0})
                      </span>
                      <button
                        onClick={() => {
                          setPackageForm({
                            dbId: undefined,
                            game_id: g.id,
                            package_id: "",
                            name: "",
                            price: 0,
                            popular: false,
                          });
                          setShowPackageModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300"
                      >
                        <Plus className="h-3 w-3" /> Add Package
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {g.packages?.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900 border border-slate-800/80"
                        >
                          <span className="text-slate-300 font-medium">
                            {p.name} {p.popular && <span className="text-[9px] text-amber-400 font-bold">(POPULAR)</span>}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-emerald-400">৳{p.price}</span>
                            <button
                              onClick={() => {
                                setPackageForm({
                                  dbId: p.dbId,
                                  game_id: g.id,
                                  package_id: p.id,
                                  name: p.name,
                                  price: p.price,
                                  popular: !!p.popular,
                                });
                                setShowPackageModal(true);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            {p.dbId && (
                              <button
                                onClick={() => handleDeletePackage(p)}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <a
                      href={`/product/${g.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Preview Page
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingGame(g);
                          const needs = g.needs || [];
                          setGameForm({
                            name: g.name,
                            slug: g.slug,
                            tagline: g.tagline || "",
                            image: g.image,
                            badge: g.badge || "",
                            category: g.category,
                            order_time: g.order_time || "",
                            description: g.description || "",
                            needsUserId: needs.some((n: any) => n.key === "userId"),
                            needsServerId: needs.some((n: any) => n.key === "serverId"),
                            needsEmail: needs.some((n: any) => n.key === "email"),
                          });
                          setShowGameModal(true);
                        }}
                        className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        Edit Game
                      </button>
                      {g.id && (
                        <button
                          onClick={() => handleDeleteGame(g)}
                          className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* GAME MODAL */}
            {showGameModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-display text-lg font-bold text-white uppercase">
                      {editingGame ? "Edit Game" : "Add New Game"}
                    </h3>
                    <button onClick={() => setShowGameModal(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveGame} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold uppercase text-slate-400">Game Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. PUBG Mobile"
                        value={gameForm.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGameForm({
                            ...gameForm,
                            name: val,
                            slug: editingGame ? gameForm.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                          });
                        }}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-slate-400">URL Slug</label>
                        <input
                          required
                          type="text"
                          placeholder="pubg-mobile"
                          value={gameForm.slug}
                          onChange={(e) => setGameForm({ ...gameForm, slug: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-slate-400">Tagline</label>
                        <input
                          type="text"
                          placeholder="UC Top-Up"
                          value={gameForm.tagline}
                          onChange={(e) => setGameForm({ ...gameForm, tagline: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-slate-400">Image URL</label>
                      <input
                        required
                        type="url"
                        placeholder="https://images.unsplash.com/... or Cloudinary URL"
                        value={gameForm.image}
                        onChange={(e) => setGameForm({ ...gameForm, image: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-slate-400">Category</label>
                        <select
                          value={gameForm.category}
                          onChange={(e) => setGameForm({ ...gameForm, category: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="battle-royale">Battle Royale</option>
                          <option value="fps">FPS</option>
                          <option value="moba">MOBA</option>
                          <option value="sports">Sports</option>
                          <option value="sandbox">Sandbox</option>
                          <option value="strategy">Strategy</option>
                          <option value="gift">Gift Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold uppercase text-slate-400">Badge</label>
                        <select
                          value={gameForm.badge}
                          onChange={(e) => setGameForm({ ...gameForm, badge: e.target.value })}
                          className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="">None</option>
                          <option value="HOT">HOT</option>
                          <option value="NEW">NEW</option>
                          <option value="TOP">TOP</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-slate-400">Required In-Game Info from User</label>
                      <div className="mt-1.5 flex gap-4">
                        <label className="flex items-center gap-1.5 text-slate-300">
                          <input
                            type="checkbox"
                            checked={gameForm.needsUserId}
                            onChange={(e) => setGameForm({ ...gameForm, needsUserId: e.target.checked })}
                          />
                          Player ID
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300">
                          <input
                            type="checkbox"
                            checked={gameForm.needsServerId}
                            onChange={(e) => setGameForm({ ...gameForm, needsServerId: e.target.checked })}
                          />
                          Server ID
                        </label>
                        <label className="flex items-center gap-1.5 text-slate-300">
                          <input
                            type="checkbox"
                            checked={gameForm.needsEmail}
                            onChange={(e) => setGameForm({ ...gameForm, needsEmail: e.target.checked })}
                          />
                          Email
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-slate-400">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Game top-up instructions, delivery time, server notes..."
                        value={gameForm.description}
                        onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowGameModal(false)}
                        className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-500"
                      >
                        Save Game
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* PACKAGE MODAL */}
            {showPackageModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-display text-base font-bold text-white uppercase">
                      {packageForm.dbId ? "Edit Coin Package" : "Add Coin Package"}
                    </h3>
                    <button onClick={() => setShowPackageModal(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold uppercase text-slate-400">Package Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 60 UC or 115 Diamond"
                        value={packageForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setPackageForm({
                            ...packageForm,
                            name,
                            package_id: packageForm.package_id || name.toLowerCase().replace(/[^a-z0-9]+/g, ""),
                          });
                        }}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase text-slate-400">Package ID / Code</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 60uc or 115d"
                        value={packageForm.package_id}
                        onChange={(e) => setPackageForm({ ...packageForm, package_id: e.target.value })}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold uppercase text-slate-400">Price in BDT (৳)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="95"
                        value={packageForm.price || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                        className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:outline-none focus:border-red-500 font-bold font-display"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isPopular"
                        checked={packageForm.popular}
                        onChange={(e) => setPackageForm({ ...packageForm, popular: e.target.checked })}
                      />
                      <label htmlFor="isPopular" className="text-slate-300 font-semibold cursor-pointer">
                        Mark as "POPULAR" Badge
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowPackageModal(false)}
                        className="rounded-xl border border-slate-700 px-4 py-2 font-bold text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-500"
                      >
                        Save Package
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SETTINGS ================= */}
        {tab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display text-2xl font-black uppercase text-white">Payment & System Settings</h2>
              <p className="text-xs text-slate-400">
                Update customer payment numbers (bKash, Nagad, Rocket) and customer checkout instructions
              </p>
            </div>

            {settingsSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Settings saved and updated in PostgreSQL database successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-pink-400">bKash Personal Number</label>
                <input
                  type="text"
                  value={settings.bkash_number || ""}
                  onChange={(e) => setSettings({ ...settings, bkash_number: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-orange-400">Nagad Personal Number</label>
                <input
                  type="text"
                  value={settings.nagad_number || ""}
                  onChange={(e) => setSettings({ ...settings, nagad_number: e.target.value })}
                  placeholder="018XXXXXXXX"
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400">Rocket Personal Number</label>
                <input
                  type="text"
                  value={settings.rocket_number || ""}
                  onChange={(e) => setSettings({ ...settings, rocket_number: e.target.value })}
                  placeholder="019XXXXXXXX"
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={settings.support_whatsapp || ""}
                  onChange={(e) => setSettings({ ...settings, support_whatsapp: e.target.value })}
                  placeholder="88017XXXXXXXX"
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notice on Checkout Screen</label>
                <textarea
                  rows={3}
                  value={settings.notice || ""}
                  onChange={(e) => setSettings({ ...settings, notice: e.target.value })}
                  placeholder="Instruction displayed to users when paying..."
                  className="w-full mt-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-3 font-display text-sm font-bold uppercase text-white shadow-lg shadow-red-600/20 hover:opacity-95 transition disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Settings to Database"}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white uppercase">{deleteConfirm.title}</h3>
                <p className="text-xs text-red-400 font-semibold">{deleteConfirm.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {deleteConfirm.subText || "Are you sure you want to proceed with this deletion? This action cannot be undone."}
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 transition shadow-lg shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
