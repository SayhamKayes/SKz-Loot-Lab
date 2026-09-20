import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { getUserOrdersFn, type OrderData } from "@/api";

export const Route = createFileRoute("/user")({
  head: () => ({
    meta: [
      { title: "User Panel & Order History — SKz Lab" },
      { name: "description", content: "Track your game top-up orders and manage your gaming account." },
    ],
  }),
  component: UserPage,
});

function UserPage() {
  const { user, login, register, logout, updateProfile } = useAuth();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  // Auth Form State
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name.trim() || !profileForm.email.trim() || !profileForm.phone.trim()) {
      setProfileError("Name, email, and phone number are required.");
      return;
    }

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        setProfileError("New password must be at least 6 characters long.");
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        setProfileError("New passwords do not match.");
        return;
      }
      if (!profileForm.currentPassword) {
        setProfileError("Please enter your current password to set a new password.");
        return;
      }
    }

    setProfileLoading(true);
    const res = await updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      currentPassword: profileForm.currentPassword || undefined,
      newPassword: profileForm.newPassword || undefined,
    });
    setProfileLoading(false);

    if (res.success) {
      setProfileSuccess("Profile updated successfully!");
      setProfileForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setTimeout(() => setProfileSuccess(""), 4000);
    } else {
      setProfileError(res.error || "Failed to update profile.");
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const data = await getUserOrdersFn({
        data: {
          userId: user.id,
          phone: user.phone,
          email: user.email,
        },
      });
      setOrders(data || []);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const res = await login(loginForm.identifier, loginForm.password);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    const res = await register(
      registerForm.name,
      registerForm.email,
      registerForm.phone,
      registerForm.password
    );
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || "Registration failed");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
            <Clock className="h-3.5 w-3.5" /> Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10">
        {!user ? (
          /* ================= GUEST / AUTHENTICATION VIEW ================= */
          <div className="mx-auto max-w-md my-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient blur */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                  <Gamepad2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <h1 className="mt-4 font-display text-2xl sm:text-3xl font-black">
                  User <span className="text-gradient-primary">Panel</span>
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Login or create an account to view your live orders and instant game deliveries.
                </p>
              </div>

              {/* Tabs */}
              <div className="mt-6 grid grid-cols-2 rounded-xl bg-surface p-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthError("");
                  }}
                  className={`rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition ${
                    authTab === "login"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("register");
                    setAuthError("");
                  }}
                  className={`rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition ${
                    authTab === "register"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message */}
              {authError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Forms */}
              {authTab === "login" ? (
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Email or Mobile Number</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="text"
                        placeholder="your@email.com or 017XXXXXXXX"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition disabled:opacity-50"
                  >
                    {authLoading ? "Logging in..." : "Log In to Panel"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="mt-6 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="text"
                        placeholder="Sayham Ahmed"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="email"
                        placeholder="sayham@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number (bKash/WhatsApp)</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="tel"
                        placeholder="017XXXXXXXX"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Password</label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="password"
                        placeholder="At least 6 characters"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition disabled:opacity-50"
                  >
                    {authLoading ? "Creating account..." : "Complete Registration"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        ) : (
          /* ================= LOGGED IN USER PANEL ================= */
          <div className="space-y-8">
            {/* Header User Banner */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center font-display text-2xl font-black text-primary-foreground shadow-glow">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-2xl md:text-3xl font-black">{user.name}</h1>
                      <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase">
                        Verified Gamer
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground flex items-center gap-4">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>{user.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-primary transition"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingOrders ? "animate-spin text-primary" : ""}`} />
                    Refresh
                  </button>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-border/80 bg-surface/60 p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Total Orders</p>
                  <p className="mt-1 font-display text-2xl font-black text-foreground">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-xs font-semibold text-amber-500 uppercase">Pending</p>
                  <p className="mt-1 font-display text-2xl font-black text-amber-500">
                    {orders.filter((o) => o.order_status === "pending").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-xs font-semibold text-blue-400 uppercase">Processing</p>
                  <p className="mt-1 font-display text-2xl font-black text-blue-400">
                    {orders.filter((o) => o.order_status === "processing").length}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-semibold text-emerald-500 uppercase">Completed</p>
                  <p className="mt-1 font-display text-2xl font-black text-emerald-500">
                    {orders.filter((o) => o.order_status === "completed").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>My Orders</span>
                <span
                  className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-mono font-bold ${
                    activeTab === "orders" ? "bg-black/20 text-white" : "bg-primary/15 text-primary"
                  }`}
                >
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </button>
            </div>

            {/* Profile Settings Section */}
            {activeTab === "profile" ? (
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/60">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold uppercase">Profile Settings</h2>
                    <p className="text-xs text-muted-foreground">
                      Update your account display name, email, phone, or password
                    </p>
                  </div>
                </div>

                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{profileSuccess}</span>
                  </motion.div>
                )}

                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 p-4 text-xs font-semibold text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{profileError}</span>
                  </motion.div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Account Information
                    </h3>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Profile / Full Name</label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                        <input
                          required
                          type="text"
                          placeholder="Your Full Name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                          <input
                            required
                            type="email"
                            placeholder="name@domain.com"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                        <div className="relative mt-1.5">
                          <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                          <input
                            required
                            type="tel"
                            placeholder="01700000000"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security / Password Change */}
                  <div className="pt-4 border-t border-border/60 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Change Password (Optional)
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Leave blank if you do not want to change your current password.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                      <div className="relative mt-1.5">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="Current password (required to change)"
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                          className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                          <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={profileForm.newPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                        <div className="relative mt-1.5">
                          <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                          <input
                            type="password"
                            placeholder="Re-type new password"
                            value={profileForm.confirmPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                            className="w-full rounded-xl border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      {profileLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (user) {
                          setProfileForm({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setProfileError("");
                          setProfileSuccess("");
                        }
                      }}
                      className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:border-primary transition cursor-pointer"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Orders Section */
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold uppercase">My Order History</h2>
                      <p className="text-xs text-muted-foreground">Track live delivery updates and in-game top-up verification</p>
                    </div>
                  </div>

                  <Link
                    to="/"
                    className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider hover:underline"
                  >
                    Buy Top-Up <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                    <p className="text-sm">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-border/80 p-8">
                    <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="font-display text-lg font-bold">No orders found yet</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      You haven't placed any top-up orders yet. Choose your favorite game and top up instantly!
                    </p>
                    <Link
                      to="/"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-xs font-bold uppercase text-primary-foreground shadow-glow hover:opacity-95 transition"
                    >
                      Start Top-Up
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border/80 bg-surface/80 p-5 hover:border-primary/50 transition shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              <Gamepad2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-black text-base">{order.game_name}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-sm font-semibold text-primary">{order.package_name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono text-muted-foreground">ID: {order.id}</span>
                                <button
                                  onClick={() => copyToClipboard(order.id, order.id)}
                                  title="Copy Order ID"
                                  className="text-muted-foreground hover:text-primary transition cursor-pointer"
                                >
                                  {copiedId === order.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Amount Paid</p>
                              <p className="font-display text-lg font-black text-gradient-primary">৳{order.amount}</p>
                            </div>
                            <div>{getStatusBadge(order.order_status)}</div>
                          </div>
                        </div>

                        {/* Details row */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Player Account Info</p>
                            <div className="mt-1 space-y-0.5 font-medium">
                              {order.player_credentials &&
                                Object.entries(order.player_credentials).map(([k, v]) => (
                                  <p key={k}>
                                    <span className="capitalize text-muted-foreground">{k}:</span>{" "}
                                    <span className="font-bold text-foreground">{String(v)}</span>
                                  </p>
                                ))}
                            </div>
                          </div>

                          <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Info</p>
                            <p className="mt-1 font-semibold capitalize">
                              Method: <span className="text-primary">{order.payment_method}</span>
                            </p>
                            <p className="text-muted-foreground">Sender: {order.payment_sender_number}</p>
                            <p className="font-mono text-[11px] text-foreground font-bold">TrxID: {order.transaction_id}</p>
                          </div>

                          <div className="rounded-xl bg-background/60 p-3 border border-border/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Date & Note</p>
                            <p className="mt-1 text-muted-foreground">
                              {new Date(order.created_at).toLocaleString("en-BD", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {order.admin_notes && (
                              <p className="mt-1.5 text-xs text-primary font-medium bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                                💬 Note: {order.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
