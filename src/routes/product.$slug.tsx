import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Package as PackageIcon,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Ticket,
  ArrowLeft,
  Copy,
  Check,
  CreditCard,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  Gamepad2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { games, getGame } from "@/lib/games";
import { getGameBySlugFn, createOrderFn, getSiteSettingsFn } from "@/api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const slug = params?.slug || "";
    try {
      const dbGame = await getGameBySlugFn({ data: { slug } });
      if (dbGame && dbGame.name && dbGame.packages?.length) {
        return { game: dbGame };
      }
    } catch (e) {
      // Fallback cleanly to static games catalog
    }
    const fallback = getGame(slug);
    if (fallback) return { game: fallback };
    throw notFound();
  },
  head: ({ loaderData }) => {
    const g = loaderData?.game;
    return {
      meta: g
        ? [
            { title: `${g.name} Top-Up — SKz Lab` },
            { name: "description", content: `${g.name} ${g.tagline || ""}. ${g.description || ""}` },
            { property: "og:title", content: `${g.name} Top-Up — SKz Lab` },
            { property: "og:description", content: g.description || "" },
            { property: "og:image", content: g.image || "" },
          ]
        : [],
    };
  },
  component: ProductPage,
  errorComponent: ({ reset }: { error: Error; reset: () => void }) => (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-black">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
          We couldn't load this top-up product right now. You can try refreshing or choose another game.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="rounded-xl bg-gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold hover:border-primary transition"
          >
            Back to all games
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-black">Game not found</h1>
        <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
          The game top-up you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-6 inline-block text-primary font-semibold hover:underline">
          ← Back to all games
        </Link>
      </div>
      <Footer />
    </div>
  ),
});

function ProductPage() {
  const loaderData = Route.useLoaderData() as { game?: any } | undefined;
  const params = Route.useParams();
  const initialGame = loaderData?.game || getGame(params?.slug) || games[0];
  const { user } = useAuth();

  const [game, setGame] = useState(initialGame);
  const [selectedPkgId, setSelectedPkgId] = useState(initialGame?.packages?.[0]?.id || "");
  const [settings, setSettings] = useState<Record<string, string>>({
    bkash_number: "01700000000",
    nagad_number: "01800000000",
    rocket_number: "01900000000",
    support_whatsapp: "8801700000000",
    notice: "Send Money to our official personal number. Put your Sender Phone & TrxID below to verify.",
  });

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "bkash",
    senderNumber: "",
    trxId: "",
    promoCode: "",
  });

  // Player in-game credentials (e.g. userId, serverId)
  const [playerCreds, setPlayerCreds] = useState<Record<string, string>>({});

  // Submission & UI states
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  // Load latest game & settings from database on mount
  useEffect(() => {
    if (!initialGame?.slug) return;
    getGameBySlugFn({ data: { slug: initialGame.slug } })
      .then((g) => {
        if (g && g.packages?.length) {
          setGame(g);
          if (!selectedPkgId && g.packages[0]) {
            setSelectedPkgId(g.packages[0].id);
          }
        }
      })
      .catch(() => {});

    getSiteSettingsFn()
      .then((s) => {
        if (s) setSettings(s);
      })
      .catch(() => {});
  }, [initialGame?.slug]);

  const activePackage =
    game?.packages?.find((p: any) => p.id === selectedPkgId) ||
    game?.packages?.[0] ||
    { id: "default", name: "Top-Up Package", price: 0 };

  const getMfsNumber = () => {
    if (formData.paymentMethod === "nagad") return settings.nagad_number || "01800000000";
    if (formData.paymentMethod === "rocket") return settings.rocket_number || "01900000000";
    return settings.bkash_number || "01700000000";
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(getMfsNumber());
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.senderNumber.trim()) {
      setErrorMessage("Please enter your MFS Sender Phone Number.");
      return;
    }

    if (!formData.trxId.trim()) {
      setErrorMessage("Please enter the exact Transaction ID (TrxID) received from MFS SMS.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createOrderFn({
        data: {
          user_id: user?.id || null,
          game_name: game.name,
          package_name: activePackage.name,
          amount: activePackage.price,
          customer_name: formData.fullName.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.phone.trim(),
          player_credentials: playerCreds,
          payment_method: formData.paymentMethod,
          payment_sender_number: formData.senderNumber.trim(),
          transaction_id: formData.trxId.trim().toUpperCase(),
        },
      });

      if (res.success && res.orderId) {
        setOrderSuccess(res.orderId);
      } else {
        setErrorMessage(res.error || "Failed to place order. Please check inputs and try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all games
        </Link>

        {/* Game Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border-2 border-primary/50 bg-card p-6 md:p-8 shadow-glow"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="h-28 w-28 overflow-hidden rounded-2xl ring-2 ring-primary/50 shrink-0 bg-surface">
              <img src={game.image} alt={game.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  <Zap className="h-3 w-3" /> Instant Top-Up
                </span>
                {game.badge && (
                  <span className="rounded-full bg-destructive/15 text-destructive border border-destructive/30 px-3 py-1 text-[11px] font-bold uppercase">
                    {game.badge}
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl font-black uppercase tracking-tight">
                {game.name}
              </h1>
              <p className="mt-1 text-primary font-semibold text-lg">{game.tagline}</p>
            </div>
          </div>

          {game.orderTime && (
            <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/10 py-3.5 px-4 text-center">
              <p className="font-display text-base md:text-lg font-bold uppercase text-primary tracking-wide">
                🕒 {game.orderTime}
              </p>
            </div>
          )}
        </motion.div>

        {/* Order Success Card */}
        <AnimatePresence>
          {orderSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-3xl border-2 border-emerald-500 bg-emerald-500/10 p-8 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-emerald-500">
                Order Received Successfully!
              </h2>
              <p className="mt-2 text-sm text-foreground max-w-lg mx-auto">
                Thank you, <span className="font-bold">{formData.fullName}</span>! Your order has been placed into our
                system. Our team is verifying your payment and delivering your game top-up.
              </p>

              <div className="my-6 inline-block rounded-2xl border border-emerald-500/40 bg-background/80 px-6 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Order ID</p>
                <p className="mt-1 font-mono text-2xl font-black text-emerald-500">{orderSuccess}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/user"
                  className="rounded-xl bg-gradient-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition"
                >
                  Track Order in User Panel →
                </Link>
                <a
                  href={`https://wa.me/${(settings.support_whatsapp || "8801700000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello SKz Lab, I just placed order ${orderSuccess} for ${game.name} (${activePackage.name}). Here is my TrxID: ${formData.trxId}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/30 transition inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" /> WhatsApp Support
                </a>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setFormData({ ...formData, trxId: "", senderNumber: "" });
                  }}
                  className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Place Another Order
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-up Form Section */}
        {!orderSuccess && (
          <div className="mt-6 rounded-3xl border-2 border-primary/40 bg-card p-6 md:p-8 shadow-lg">
            {/* Step 1: Select Package */}
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <PackageIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Step 1</span>
                  <h2 className="font-display text-xl md:text-2xl font-black uppercase">Select Your Coin Package</h2>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {game.packages?.map((p: any) => {
                  const active = selectedPkgId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPkgId(p.id)}
                      className={`relative rounded-2xl border-2 p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary/15 shadow-glow"
                          : "border-border bg-surface hover:border-primary/50"
                      }`}
                    >
                      {p.popular && (
                        <span className="absolute -top-2.5 right-2 rounded-full bg-gradient-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-primary-foreground shadow-sm">
                          POPULAR
                        </span>
                      )}
                      <p className="font-bold text-foreground text-sm leading-snug">{p.name}</p>
                      <p className="mt-1 text-primary font-display text-xl font-black">৳{p.price}</p>
                      {active && <CheckCircle2 className="absolute right-3 bottom-3 h-5 w-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: In-Game Details & Contact */}
            <div className="my-10 border-t border-border/80 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Step 2</span>
                  <h2 className="font-display text-xl md:text-2xl font-black uppercase">
                    Account & In-Game Credentials
                  </h2>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your name"
                      className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Mobile / WhatsApp Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Dynamic in-game fields (Player ID, Server ID, etc.) */}
                  {game.needs &&
                    game.needs.map((field: any) => (
                      <div key={field.key}>
                        <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4 text-primary" /> {field.label}{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          required
                          value={playerCreds[field.key] || ""}
                          onChange={(e) => setPlayerCreds({ ...playerCreds, [field.key]: e.target.value })}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          className="mt-2 w-full rounded-xl border-2 border-primary/50 bg-input px-4 py-2.5 text-sm font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                </div>

                {/* Step 3: Payment Method (bKash, Nagad, Rocket) */}
                <div className="border-t border-border/80 pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Step 3</span>
                      <h2 className="font-display text-xl md:text-2xl font-black uppercase">Payment Verification</h2>
                    </div>
                  </div>

                  {/* Method selector */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "bkash", name: "bKash", color: "from-pink-600 to-rose-600", border: "border-pink-500" },
                      { id: "nagad", name: "Nagad", color: "from-orange-600 to-amber-600", border: "border-orange-500" },
                      { id: "rocket", name: "Rocket", color: "from-purple-600 to-indigo-600", border: "border-purple-500" },
                    ].map((m) => {
                      const active = formData.paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                          className={`rounded-2xl border-2 p-4 text-center transition ${
                            active
                              ? `${m.border} bg-surface shadow-md ring-2 ring-primary/40`
                              : "border-border bg-surface/60 hover:border-slate-600"
                          }`}
                        >
                          <span className="font-display text-base font-black uppercase block">{m.name}</span>
                          <span className="text-[11px] text-muted-foreground">Send Money</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Instructions Box */}
                  <div className="mt-5 rounded-2xl border border-primary/30 bg-surface p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          Official {formData.paymentMethod.toUpperCase()} Personal Number:
                        </p>
                        <p className="mt-1 font-mono text-2xl font-black text-primary">{getMfsNumber()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={copyNumber}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/40 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition self-start sm:self-center"
                      >
                        {copiedNumber ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        {copiedNumber ? "Copied!" : "Copy Number"}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
                      💡 <strong>Instructions:</strong> Go to your {formData.paymentMethod.toUpperCase()} app &gt; select{" "}
                      <strong>Send Money</strong> &gt; send exact{" "}
                      <span className="text-primary font-bold">৳{activePackage.price}</span> to the above number &gt;
                      enter your Sender Number and the received <strong>TrxID</strong> below.
                    </p>
                  </div>

                  {/* Payment input fields */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Your {formData.paymentMethod.toUpperCase()} Sender
                        Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.senderNumber}
                        onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" /> Transaction ID (TrxID){" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        required
                        value={formData.trxId}
                        onChange={(e) => setFormData({ ...formData, trxId: e.target.value })}
                        placeholder="e.g. 9J8A1K20"
                        className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-mono font-bold uppercase text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Total Summary & Submit */}
                <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Payable</p>
                    <p className="font-display text-4xl font-black text-gradient-primary">৳{activePackage.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Selected Package</p>
                    <p className="font-bold text-foreground text-sm">{activePackage.name}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-8 py-4 font-display text-lg font-black uppercase tracking-wider text-primary-foreground shadow-glow hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {submitting ? "Processing Order..." : "Confirm & Place Top-Up Order"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Important Info Card */}
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8">
          <h3 className="font-display text-xl font-black uppercase">Top-Up Delivery Policy</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{game.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Zap, t: "Instant Delivery (5-10m)" },
              { icon: ShieldCheck, t: "100% Authorized & Safe" },
              { icon: Headphones, t: "24/7 WhatsApp Support" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
