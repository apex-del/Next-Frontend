"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import SkeletonCard from "./SkeletonCard";
import type { JikanAnime } from "@/lib/jikan";

interface AnimeRowProps {
  title: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
  linkTo?: string;
}

export default function AnimeRow({
  title,
  animeList,
  isLoading,
  linkTo,
}: AnimeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-[180px] shrink-0">
                  <SkeletonCard />
                </div>
              ))
            : animeList.map((anime, i) => (
                <div key={anime.mal_id} className="w-[180px] shrink-0">
                  <AnimeCard anime={anime} index={i} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
