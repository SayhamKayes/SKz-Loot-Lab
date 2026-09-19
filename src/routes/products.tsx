import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star, Zap, CheckCircle2, Send, X, ShoppingBag } from "lucide-react";
import { getSiteSettingsFn } from "@/api";

interface Gadget {
  name: string;
  price: number;
  img: string;
  rating: number;
  stock: boolean;
  desc?: string;
}

const gadgets: Gadget[] = [
  {
    name: "Razer Finger Sleeve",
    price: 290,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1765274518/gamerz-prime/H9e727539111a480fa431c864cf0841ef2_73dcc59043.jpg",
    rating: 5,
    stock: true,
    desc: "Ultra-sensitive conductive silver fiber for smooth swipe control and sweat-proof gaming.",
  },
  {
    name: "Damile X11 RGB Magnetic Phone Cooler",
    price: 1800,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1762790996/gamerz-prime/Product_Image_1_51b6fbe0ec.png",
    rating: 5,
    stock: false,
    desc: "Magnetic phone semiconductor cooling fan with multi-mode RGB lighting and silent operation.",
  },
  {
    name: "Plextone G20 Mark IV Gaming Earphones",
    price: 950,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1765274520/gamerz-prime/Plextone_G20_Mark_IV_Gaming_Earphone_Type_C_01_566b6c2049.webp",
    rating: 5,
    stock: true,
    desc: "Type-C gaming earphone with footstep tracking surround sound and noise-cancelling dual mic.",
  },
  {
    name: "Damile D20 Semi-Conductor Cooler",
    price: 1350,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1762791484/gamerz-prime/01_13e86c05a9.jpg",
    rating: 5,
    stock: true,
    desc: "Instant freezing technology clip-on cooler to prevent frame drops during tournament battles.",
  },
  {
    name: "Plextone 4Pro Gaming Earbuds",
    price: 1650,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1765274522/gamerz-prime/61d_E2_Cshd7_L_AC_UF1000_1000_QL80_c11d61c6b1.jpg",
    rating: 4,
    stock: true,
    desc: "Ultra-low 45ms latency true wireless earbuds tuned specifically for tactical mobile shooters.",
  },
  {
    name: "Memo CX07 Magnetic Phone Cooler",
    price: 1450,
    img: "https://res.cloudinary.com/nooboss/image/upload/v1762791730/gamerz-prime/01_ef3b77ce80.jpg",
    rating: 5,
    stock: true,
    desc: "Premium aerospace aluminum cooling surface with digital temperature display.",
  },
];

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Gaming Gadgets & Gear — SKz Lab" },
      { name: "description", content: "Top tier mobile gaming accessories, finger sleeves, coolers, and earphones." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const [supportWhatsApp, setSupportWhatsApp] = useState("8801700000000");

  useEffect(() => {
    getSiteSettingsFn()
      .then((s) => {
        if (s?.support_whatsapp) setSupportWhatsApp(s.support_whatsapp);
      })
      .catch(() => {});
  }, []);

  const getWhatsAppLink = (gadget: Gadget) => {
    const text = encodeURIComponent(
      `Hello SKz Lab! I want to order the gaming gadget "${gadget.name}" priced at ৳${gadget.price}. Please let me know how to proceed.`
    );
    const cleanNum = supportWhatsApp.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNum}?text=${text}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12 flex-1 w-full">
        {/* Top-Up Fast Switch Banner */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Looking for Game Top-Ups?</p>
              <p className="text-xs text-muted-foreground">PUBG UC, Free Fire Diamonds, MLBB, Valorant VP & more.</p>
            </div>
          </div>
          <Link
            to="/"
            hash="top-ups"
            className="rounded-xl bg-gradient-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition inline-flex items-center gap-1.5"
          >
            Top Up Now →
          </Link>
        </div>

        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black">
            Gaming <span className="text-gradient-primary">Gadgets</span>
          </h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Check &amp; Get Your Desired Product
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {gadgets.map((g) => (
            <div
              key={g.name}
              onClick={() => setSelectedGadget(g)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-card hover:border-primary hover:shadow-glow transition flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-surface">
                  <img
                    src={g.img}
                    alt={g.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {!g.stock && (
                    <span className="absolute top-3 left-3 rounded-full bg-destructive px-3 py-1 text-[10px] font-bold text-destructive-foreground">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition">
                    {g.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display text-lg font-black text-primary">৳{g.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {g.rating}/5
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGadget(g);
                  }}
                  className="w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition shadow-sm"
                >
                  {g.stock ? "View & Order" : "Details"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Product Details Modal */}
        {selectedGadget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-3xl border-2 border-primary/50 bg-card p-6 md:p-8 shadow-2xl overflow-hidden">
              <button
                onClick={() => setSelectedGadget(null)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-surface border border-border">
                  <img src={selectedGadget.img} alt={selectedGadget.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {selectedGadget.rating}/5 Rating
                    </span>
                    {selectedGadget.stock ? (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        In Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-[10px] font-bold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-black text-foreground">{selectedGadget.name}</h3>
                  <p className="mt-1 font-display text-3xl font-black text-gradient-primary">
                    ৳{selectedGadget.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Product Description</p>
                <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
                  {selectedGadget.desc || "Official high-performance gaming accessory with guaranteed quality."}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={getWhatsAppLink(selectedGadget)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-glow hover:opacity-95 transition"
                >
                  <Send className="h-4 w-4" /> Order via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedGadget(null)}
                  className="w-full rounded-2xl border border-border bg-surface py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
