import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SKz Lab" },
      { name: "description", content: "SKz Lab is Bangladesh's trusted gaming top-up hub." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl font-black">About <span className="text-gradient-primary">SKz Lab</span></h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          SKz Lab is a trusted gaming top-up and accessory hub built for gamers across Bangladesh and beyond.
          We deliver UC, diamonds, VP, Robux and more — instantly, securely, and at the best prices.
        </p>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Backed by 24/7 support and verified payment integrations, we've served thousands of gamers with a
          5-star track record. Top up your favourite game in seconds.
        </p>
      </main>
      <Footer />
    </div>
  );
}
