import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SKz Lab" },
      { name: "description", content: "Get in touch with SKz Lab support team. 24/7 customer service." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black">Get in <span className="text-gradient-primary">Touch</span></h1>
          <p className="mt-3 text-muted-foreground">We're online 24/7 — reach out anytime.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageCircle, t: "WhatsApp", v: "+880 1XXX-XXXXXX" },
            { icon: Mail, t: "Email", v: "support@skzlab.com" },
            { icon: Phone, t: "Hotline", v: "+880 9600-000000" },
            { icon: MapPin, t: "Address", v: "Dhaka, Bangladesh" },
          ].map(({ icon: Icon, t, v }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 hover:border-primary transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t}</p>
              <p className="mt-1 font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
