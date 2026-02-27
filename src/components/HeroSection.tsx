"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle, getBannerImage } from "@/lib/jikan";

interface HeroSectionProps {
  animeList: JikanAnime[];
}

export default function HeroSection({ animeList }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const featured = animeList.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const anime = featured[current];
  const bannerUrl = getBannerImage(anime);

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={bannerUrl}
            alt={getDisplayTitle(anime)}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 gradient-overlay-right" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 pb-16 md:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="mb-3 flex items-center gap-3">
                {anime.score && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold">{anime.score}</span>
                  </div>
                )}
                <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium text-secondary-foreground">
                  #{anime.rank} Ranked
                </span>
                <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {anime.type}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
                {getDisplayTitle(anime)}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                {anime.year && <span>{anime.year}</span>}
                {anime.episodes && (
                  <>
                    <span>•</span>
                    <span>{anime.episodes} Episodes</span>
                  </>
                )}
                {anime.studios?.[0] && (
                  <>
                    <span>•</span>
                    <span>{anime.studios[0].name}</span>
                  </>
                )}
              </div>

              {/* Synopsis */}
              <p className="text-sm md:text-base text-muted-foreground line-clamp-3 mb-6 max-w-xl leading-relaxed">
                {anime.synopsis}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/anime/${anime.mal_id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                >
                  <Play className="h-5 w-5 fill-current" />
                  View Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-primary"
                : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + featured.length) % featured.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-foreground hover:bg-secondary transition-colors hidden md:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % featured.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-foreground hover:bg-secondary transition-colors hidden md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
