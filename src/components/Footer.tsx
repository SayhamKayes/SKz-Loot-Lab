import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Gamepad2, MessageCircle, Send, Globe, Mail } from "lucide-react";
import { getSiteSettingsFn } from "@/api";

export const Footer = () => {
  const [whatsapp, setWhatsapp] = useState("8801700000000");

  useEffect(() => {
    getSiteSettingsFn()
      .then((s) => {
        if (s?.support_whatsapp) setWhatsapp(s.support_whatsapp);
      })
      .catch(() => {});
  }, []);

  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">SKz<span className="text-gradient-primary">LAB</span></span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Your ultimate gaming hub. Instant top-ups, premium gear, lightning-fast delivery.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Top-Ups</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/product/$slug" params={{ slug: "pubg-mobile" }} className="hover:text-primary">PUBG Mobile</Link></li>
            <li><Link to="/product/$slug" params={{ slug: "free-fire-bd" }} className="hover:text-primary">Free Fire</Link></li>
            <li><Link to="/product/$slug" params={{ slug: "mobile-legends" }} className="hover:text-primary">Mobile Legends</Link></li>
            <li><Link to="/product/$slug" params={{ slug: "valorant" }} className="hover:text-primary">Valorant</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/products" className="hover:text-primary">Gadgets</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Support & Follow</h4>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hello SKz Lab Support!")}`}
              target="_blank"
              rel="noreferrer"
              title="Chat on WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-emerald-500 hover:text-white transition"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            {[
              { Icon: Send, href: "https://t.me/skzlab", title: "Telegram" },
              { Icon: Globe, href: "#", title: "Community" },
              { Icon: Mail, href: "mailto:support@skzlab.com", title: "Email Us" },
            ].map(({ Icon, href, title }, i) => (
              <a
                key={i}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                title={title}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-primary hover:text-primary-foreground transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            WhatsApp: <span className="font-mono text-foreground font-semibold">{whatsapp}</span>
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SKz Lab. All rights reserved.
      </div>
    </footer>
  );
};
