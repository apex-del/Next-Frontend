"use client";

import Link from "next/link";
import { Star, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";

interface PopularTopGridProps {
  title: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
}

export default function PopularTopGrid({ title, animeList, isLoading }: PopularTopGridProps) {
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <Link 
            href="/top-charts" 
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            View More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.slice(0, 12).map((anime, i) => (
            <motion.div
              key={anime.mal_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/anime/${anime.mal_id}`} className="group block">
                <div className="relative overflow-hidden rounded-lg bg-card transition-all duration-300 card-glow group-hover:card-glow-hover group-hover:scale-[1.03]">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                      alt={getDisplayTitle(anime)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {anime.score && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold">{anime.score}</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 rounded-md bg-primary/90 px-2 py-0.5">
                      <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                        {anime.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {getDisplayTitle(anime)}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {anime.year && <span>{anime.year}</span>}
                      {anime.episodes && (
                        <>
                          <span>•</span>
                          <span>{anime.episodes} eps</span>
                        </>
                      )}
                    </div>
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
