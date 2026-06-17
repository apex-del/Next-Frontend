"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GitBranch, ImageOff } from "lucide-react";
import { getRelationsTrio } from "@/lib/animeData";
import { makeAnimeSlug } from "@/lib/slug";

export default function RelatedAnime({ animeId }: { animeId: number }) {
  const { data: groups = [] } = useQuery({
    queryKey: ["anime-relations-trio", animeId],
    queryFn: () => getRelationsTrio(animeId),
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  if (groups.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        Related Anime
      </h2>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.relation}>
            <span className="text-xs font-bold text-primary mb-2 block uppercase tracking-wide">
              {g.relation}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {g.entries.map((e) => (
                <Link
                  key={e.mal_id}
                  href={`/anime/${makeAnimeSlug(e.title, e.mal_id)}`}
                  className="group rounded-xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-colors"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    {e.image ? (
                      <img
                        src={e.image}
                        alt={e.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-secondary p-2 text-center">
                        <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                        <span className="text-[9px] text-muted-foreground/70">No image</span>
                      </div>
                    )}
                    {e.format && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
                        {e.format}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {e.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
