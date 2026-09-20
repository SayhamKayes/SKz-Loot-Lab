import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Gamepad2, MessageCircle, Send, Mail, Phone } from "lucide-react";
import { getSiteSettingsFn } from "@/api";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    support_whatsapp: "8801700000000",
    support_email: "support@skzlab.com",
    hotline_number: "+880 9600-000000",
    social_facebook: "",
    social_youtube: "",
    social_discord: "",
    social_telegram: "https://t.me/skzlab",
  });

  useEffect(() => {
    getSiteSettingsFn()
      .then((s) => {
        if (s) setSiteSettings((prev) => ({ ...prev, ...s }));
      })
      .catch(() => {});
  }, []);

  const cleanWhatsApp = (siteSettings.support_whatsapp || "8801700000000").replace(/[^0-9]/g, "");

  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold">
              SKz<span className="text-gradient-primary">LAB</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Your ultimate gaming hub. Instant top-ups, premium gear, lightning-fast delivery.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Top-Ups</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/product/$slug" params={{ slug: "pubg-mobile" }} className="hover:text-primary">
                PUBG Mobile
              </Link>
            </li>
            <li>
              <Link to="/product/$slug" params={{ slug: "free-fire-bd" }} className="hover:text-primary">
                Free Fire
              </Link>
            </li>
            <li>
              <Link to="/product/$slug" params={{ slug: "mobile-legends" }} className="hover:text-primary">
                Mobile Legends
              </Link>
            </li>
            <li>
              <Link to="/product/$slug" params={{ slug: "valorant" }} className="hover:text-primary">
                Valorant
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">
                Gadgets
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Support & Follow</h4>
          <div className="flex flex-wrap gap-2.5">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hello SKz Lab Support!")}`}
              target="_blank"
              rel="noreferrer"
              title="Chat on WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-emerald-500 hover:text-white transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
            </a>

            {/* Telegram */}
            {siteSettings.social_telegram && (
              <a
                href={siteSettings.social_telegram}
                target="_blank"
                rel="noreferrer"
                title="Telegram Support / Channel"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-sky-500 hover:text-white transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </a>
            )}

            {/* Facebook */}
            {siteSettings.social_facebook && (
              <a
                href={siteSettings.social_facebook}
                target="_blank"
                rel="noreferrer"
                title="Facebook Page / Group"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-blue-600 hover:text-white transition cursor-pointer"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            )}

            {/* YouTube */}
            {siteSettings.social_youtube && (
              <a
                href={siteSettings.social_youtube}
                target="_blank"
                rel="noreferrer"
                title="YouTube Channel"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-red-600 hover:text-white transition cursor-pointer"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            )}

            {/* Discord */}
            {siteSettings.social_discord && (
              <a
                href={siteSettings.social_discord}
                target="_blank"
                rel="noreferrer"
                title="Discord Server"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-indigo-600 hover:text-white transition cursor-pointer"
              >
                <DiscordIcon className="h-4 w-4" />
              </a>
            )}

            {/* Email */}
            {siteSettings.support_email && (
              <a
                href={`mailto:${siteSettings.support_email}`}
                title="Email Us"
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="mt-4 space-y-1 text-xs text-muted-foreground">
            <p>
              WhatsApp:{" "}
              <span className="font-mono text-foreground font-semibold">
                {siteSettings.support_whatsapp || "01700000000"}
              </span>
            </p>
            {siteSettings.hotline_number && (
              <p>
                Hotline:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {siteSettings.hotline_number}
                </span>
              </p>
            )}
            {siteSettings.support_email && (
              <p>
                Email:{" "}
                <span className="text-foreground font-semibold">
                  {siteSettings.support_email}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SKz Lab. All rights reserved.
      </div>
    </footer>
  );
};
