import { Link } from "@tanstack/react-router";
import { Zap, Trophy, Star, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 opacity-40">
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary blur-3xl opacity-30" />
      <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-primary-glow blur-3xl opacity-25" />
    </div>
    <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          <Zap className="h-3.5 w-3.5" /> Instant Delivery
        </span>
        <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-gradient-primary">SKZ LAB</span>
          <br />
          <span className="text-foreground">YOUR ULTIMATE GAMING HUB</span>
        </h1>
        <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
          Get instant game top-ups, premium gaming gear, and accessories. Best prices, lightning-fast delivery, and unbeatable quality.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 font-bold text-primary-foreground shadow-glow hover:scale-[1.02] transition">
            GAMING GADGET <ChevronRight className="h-4 w-4" />
          </Link>
          <a href="#top-ups" className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 font-bold text-primary hover:bg-primary hover:text-primary-foreground transition">
            GAME COIN TOP-UP <ChevronRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { icon: Zap, label: "Fast Delivery" },
            { icon: Trophy, label: "Best Prices" },
            { icon: Star, label: "Top Quality" },
            { icon: ShieldCheck, label: "Secure Payment" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur">
              <Icon className="h-4 w-4 text-primary" /> {label}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative aspect-[4/3] w-full"
      >
        <div className="absolute inset-0 rounded-3xl border-2 border-primary bg-card overflow-hidden shadow-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-primary-glow/20" />
          <div className="relative h-full w-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="font-display text-5xl md:text-6xl font-black tracking-tight text-foreground">
                VERIFIED BY
              </div>
              <div className="mt-2 text-gradient-primary font-display text-4xl md:text-5xl font-black">
                SKZ LAB
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-sm mx-auto">
                Trusted by 50,000+ gamers across Bangladesh & beyond.
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">50K+ ORDERS</span>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">5★ RATED</span>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);
