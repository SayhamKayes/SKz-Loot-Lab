import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { GameGrid } from "@/components/GameGrid";
import { Zap, ShieldCheck, Headphones } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SKz Lab — Instant Game Top-Up & Gaming Gadgets" },
      { name: "description", content: "Buy PUBG UC, Free Fire diamonds, Mobile Legends, Valorant VP and more. Instant delivery, best prices in Bangladesh." },
      { property: "og:title", content: "SKz Lab — Your Ultimate Gaming Hub" },
      { property: "og:description", content: "Instant game top-ups, premium gaming gear, lightning-fast delivery." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <GameGrid />
        <section className="mx-auto max-w-7xl px-6 py-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Instant Delivery", desc: "Most orders fulfilled in 5–10 minutes." },
            { icon: ShieldCheck, title: "Secure Payment", desc: "Pay via bKash, Nagad, Rocket or card." },
            { icon: Headphones, title: "24/7 Support", desc: "We're always online to help you." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 hover:border-primary transition">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
