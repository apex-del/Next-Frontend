"use client";

import Link from "next/link";
import { Trophy, Star } from "lucide-react";
import { useTopAnime } from "@/hooks/useAnime";
import { getDisplayTitle } from "@/lib/jikan";
import { makeAnimeSlug } from "@/lib/slug";

interface Props {
  limit?: number;
  excludeId?: number;
  variant?: "list" | "block" | "featured";
}

export default function PopularLeaderboard({ limit, excludeId, variant = "list" }: Props) {
  const featured = variant === "featured";
  const block = variant === "block";
  const max = limit ?? (featured ? 12 : block ? 8 : 10);
  const { data, isLoading } = useTopAnime("bypopularity", 1);
  const items = (data?.data || []).filter((a) => a.mal_id !== excludeId).slice(0, max);

  return (
    <section className={`rounded-xl bg-card border border-border ${block ? "p-4 sm:p-6" : "p-4 sm:p-5"}`}>
      <h2 className={`font-bold mb-4 flex items-center gap-2 ${featured || block ? "text-lg sm:text-2xl" : "text-base sm:text-lg"}`}>
        <Trophy className={featured || block ? "h-5 w-5 sm:h-7 sm:w-7 text-primary" : "h-4 w-4 sm:h-5 sm:w-5 text-primary"} />
        Most Popular
      </h2>

      {isLoading ? (
        <div className={featured ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" : "space-y-2"}>
          {Array.from({ length: featured ? 8 : block ? 6 : 5 }).map((_, i) => (
            <div key={i} className={`rounded-lg bg-secondary animate-pulse ${featured ? "h-24" : block ? "h-20" : "h-14"}`} />
          ))}
        </div>
      ) : featured ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((a, i) => (
            <Link
              key={a.mal_id}
              href={`/anime/${makeAnimeSlug(getDisplayTitle(a), a.mal_id)}`}
              className="group relative flex gap-3 rounded-xl border border-border bg-secondary/40 p-2.5 hover:border-primary/40 hover:bg-surface-hover transition-all"
            >
              <span
                className={`absolute -top-2 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold shadow ${
                  i < 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {i + 1}
              </span>
              <img
                src={a.images.webp.image_url || a.images.jpg.image_url}
                alt={getDisplayTitle(a)}
                loading="lazy"
                className="h-20 w-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {getDisplayTitle(a)}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  {a.score && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                      {a.score}
                    </span>
                  )}
                  {a.type && <span>{a.type}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : block ? (
        <ol className="space-y-2.5">
          {items.map((a, i) => (
            <li key={a.mal_id}>
              <Link
                href={`/anime/${makeAnimeSlug(getDisplayTitle(a), a.mal_id)}`}
                className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-secondary/40 p-3 sm:p-4 hover:border-primary/40 hover:bg-surface-hover transition-colors group"
              >
                <span
                  className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg font-extrabold text-sm ${
                    i < 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {i + 1}
                </span>
                <img
                  src={a.images.webp.image_url || a.images.jpg.image_url}
                  alt={getDisplayTitle(a)}
                  loading="lazy"
                  className="h-20 w-14 sm:h-24 sm:w-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {getDisplayTitle(a)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {a.score && (
                      <span className="flex items-center gap-1 rounded-md bg-card px-2 py-1">
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        {a.score}
                      </span>
                    )}
                    {a.type && <span className="rounded-md bg-card px-2 py-1">{a.type}</span>}
                    {a.episodes && <span className="rounded-md bg-card px-2 py-1">{a.episodes} eps</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="space-y-1.5">
          {items.map((a, i) => (
            <li key={a.mal_id}>
              <Link
                href={`/anime/${makeAnimeSlug(getDisplayTitle(a), a.mal_id)}`}
                className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-surface-hover transition-colors group"
              >
                <span
                  className={`shrink-0 w-6 text-center font-extrabold text-sm ${
                    i < 3 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <img
                  src={a.images.webp.image_url || a.images.jpg.image_url}
                  alt={getDisplayTitle(a)}
                  loading="lazy"
                  className="h-12 w-9 rounded object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {getDisplayTitle(a)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    {a.score && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                        {a.score}
                      </span>
                    )}
                    {a.type && <span>{a.type}</span>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
