import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { games as fallbackGames, Game } from "@/lib/games";
import { getGamesFn } from "@/api";

const badgeColors: Record<string, string> = {
  HOT: "bg-destructive text-destructive-foreground",
  NEW: "bg-emerald-500 text-white",
  TOP: "bg-gradient-primary text-primary-foreground",
};

export const GameGrid = () => {
  const [gamesList, setGamesList] = useState<Game[]>(fallbackGames);

  useEffect(() => {
    getGamesFn()
      .then((data) => {
        if (data && data.length > 0) {
          setGamesList(data);
        }
      })
      .catch((err) => console.warn("Could not load dynamic games, using fallback:", err));
  }, []);

  return (
    <section id="top-ups" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <Trophy className="h-7 w-7 text-primary" />
            <h2 className="font-display text-4xl font-black md:text-5xl">Top Up Now</h2>
            <Trophy className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Choose Your Game</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {gamesList.map((game, i) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link
                to="/product/$slug"
                params={{ slug: game.slug }}
                className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-3 transition hover:border-primary hover:shadow-glow"
              >
                {game.badge && (
                  <span
                    className={`absolute right-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      badgeColors[game.badge] || "bg-primary text-primary-foreground"
                    }`}
                  >
                    {game.badge}
                  </span>
                )}
                <div className="aspect-square overflow-hidden rounded-xl bg-surface">
                  <img
                    src={game.image}
                    alt={game.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-display text-sm font-bold uppercase tracking-wide truncate">{game.name}</p>
                  <p className="mt-0.5 text-xs text-primary font-semibold truncate">{game.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
