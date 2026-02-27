"use client";

import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";

interface LeaderboardGridProps {
  title: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
}

export default function LeaderboardGrid({ title, animeList, isLoading }: LeaderboardGridProps) {
  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <Link href="/top-charts" className="text-sm text-primary hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {animeList.slice(0, 9).map((anime, i) => (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/anime/${anime.mal_id}`}
                className="flex items-center gap-3 rounded-lg bg-card border border-border p-3 transition-all hover:border-primary/30 hover:bg-surface-hover group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </div>
                <img
                  src={anime.images.webp.small_image_url || anime.images.jpg.small_image_url}
                  alt={getDisplayTitle(anime)}
                  className="h-14 w-10 rounded object-cover shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {getDisplayTitle(anime)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {anime.score && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        {anime.score}
                      </span>
                    )}
                    <span>{anime.type}</span>
                    {anime.episodes && <span>{anime.episodes} eps</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
