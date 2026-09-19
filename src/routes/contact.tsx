import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { getSiteSettingsFn } from "@/api";

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
  const [whatsapp, setWhatsapp] = useState("8801700000000");

  useEffect(() => {
    getSiteSettingsFn()
      .then((s) => {
        if (s?.support_whatsapp) setWhatsapp(s.support_whatsapp);
      })
      .catch(() => { });
  }, []);

  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black">Get in <span className="text-gradient-primary">Touch</span></h1>
          <p className="mt-3 text-muted-foreground">We're online 24/7 — reach out anytime.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: MessageCircle,
              t: "WhatsApp",
              v: whatsapp,
              link: `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hello SKz Lab Support!")}`,
            },
            { icon: Mail, t: "Email", v: "support@skzlab.com", link: "mailto:support@skzlab.com" },
            { icon: Phone, t: "Hotline", v: "+880 9600-000000", link: "tel:+8809600000000" },
          ].map(({ icon: Icon, t, v, link }) => (
            <div
              key={t}
              onClick={() => link && window.open(link, link.startsWith("http") ? "_blank" : "_self")}
              className={`rounded-2xl border border-border bg-card p-6 transition ${link ? "cursor-pointer hover:border-primary hover:shadow-glow" : ""
                }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t}</p>
              <p className="mt-1 font-semibold truncate">{v}</p>
              {link && <p className="mt-2 text-[10px] text-primary font-bold uppercase">Click to contact →</p>}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
