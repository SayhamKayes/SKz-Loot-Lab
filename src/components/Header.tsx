import { Link } from "@tanstack/react-router";
import { Moon, Sun, Search, User, Gamepad2, Shield } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { theme, toggle } = useTheme();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow group-hover:scale-105 transition">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            <span className="text-gradient-primary">SKz</span><span className="text-foreground">LOOT</span><span className="text-gradient-primary">LAB</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <Link to="/" hash="top-ups" className="hover:text-primary transition">Top-Ups</Link>
          <Link to="/products" className="hover:text-primary transition">Gadgets</Link>
          <Link to="/contact" className="hover:text-primary transition">Contact</Link>
          {isAdmin && (
            <Link to="/admin" className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card hover:bg-surface-2 transition"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Account / Login Button */}
          <Link
            to="/user"
            className="flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition"
          >
            <User className="h-4 w-4" />
            <span>{user?.name ? user.name.split(" ")[0] : "Account"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
