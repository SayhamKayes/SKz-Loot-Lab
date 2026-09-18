import { Link } from "@tanstack/react-router";
import { Gamepad2, MessageCircle, Send, Globe, Mail } from "lucide-react";

export const Footer = () => (
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
        <h4 className="font-semibold mb-3 text-sm">Follow</h4>
        <div className="flex gap-3">
          {[MessageCircle, Send, Globe, Mail].map((Icon, i) => (
            <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-primary hover:text-primary-foreground transition">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} SKz Lab. All rights reserved.
    </div>
  </footer>
);
