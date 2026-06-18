"use client";

import Link from "next/link";
import { Play, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/hooks/useAuth";
import { makeAnimeSlug } from "@/lib/slug";

export default function ContinueWatching() {
  const { user } = useAuth();
  const { history, isLoading } = useWatchHistory();

  const items = useMemo(() => {
    const seen = new Map<number, any>();
    for (const h of history) {
      if (!seen.has(h.anime_id)) seen.set(h.anime_id, h);
    }
    return Array.from(seen.values()).slice(0, 12);
  }, [history]);

  if (!user || isLoading || items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Continue Watching
        </h2>
        <Link href="/history" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          View all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {items.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="snap-start shrink-0 w-40 sm:w-48"
          >
            <Link
              href={`/watch/${makeAnimeSlug(h.anime_title, h.anime_id)}?ep=${h.episode_number || 1}`}
              className="block group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <div className="relative aspect-video overflow-hidden">
                {h.anime_image && (
                  <img src={h.anime_image} alt={h.anime_title} loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-primary/90 p-2.5">
                    <Play className="h-5 w-5 text-primary-foreground fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 left-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  EP {h.episode_number || 1}
                </span>
              </div>
              <p className="p-2 text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {h.anime_title}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
