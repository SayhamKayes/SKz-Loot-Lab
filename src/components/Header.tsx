import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  User,
  Gamepad2,
  Menu,
  X,
  Home,
  Zap,
  ShoppingBag,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow group-hover:scale-105 transition">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            <span className="text-gradient-primary">SKz</span>
            <span className="text-foreground">LOOT</span>
            <span className="text-gradient-primary">LAB</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link to="/" hash="top-ups" className="hover:text-primary transition">
            Top-Ups
          </Link>
          <Link to="/products" className="hover:text-primary transition">
            Gadgets
          </Link>
          <Link to="/contact" className="hover:text-primary transition">
            Contact
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button - Fixed & Visible on all screens */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-card hover:bg-surface-2 transition text-foreground cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Desktop User Account Button (Shows User's Name when logged in) */}
          <Link
            to="/user"
            className="hidden md:flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-90 transition"
          >
            <User className="h-4 w-4 shrink-0" />
            <span className="max-w-[140px] truncate">{user?.name ? user.name : "Account"}</span>
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="grid md:hidden h-10 w-10 place-items-center rounded-lg border border-border bg-card hover:bg-surface-2 transition text-foreground cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-primary" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-5 shadow-2xl overflow-hidden"
          >
            {/* Account Status Card in Mobile Menu */}
            {user ? (
              <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between">
                <Link
                  to="/user"
                  onClick={closeMenu}
                  className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90 transition"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-primary flex items-center justify-center font-display text-base font-black text-primary-foreground shadow-glow">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || user.phone}</p>
                  </div>
                </Link>
                <Link
                  to="/user"
                  onClick={closeMenu}
                  className="shrink-0 ml-2 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                to="/user"
                onClick={closeMenu}
                className="mb-4 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-primary py-2.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                <User className="h-4 w-4" />
                <span>Account / Login</span>
              </Link>
            )}

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2 transition text-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Home className="h-4 w-4" />
                  </div>
                  <span>Home</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>

              <Link
                to="/"
                hash="top-ups"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2 transition text-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span>Top-Ups</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>

              <Link
                to="/products"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2 transition text-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <span>Gadgets</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>

              <Link
                to="/contact"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2 transition text-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span>Contact</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>

              {/* Account Link in Menu list */}
              <Link
                to="/user"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2 transition text-foreground"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="truncate">{user?.name ? user.name : "Account"}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </Link>
            </div>

            {/* Logout button if logged in */}
            {user && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
