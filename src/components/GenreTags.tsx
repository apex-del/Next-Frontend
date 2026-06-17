"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { useGenres } from "@/hooks/useAnime";

export default function GenreTags() {
  const { data } = useGenres();
  const genres = (data?.data || []).slice(0, 24);

  if (genres.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {genres.map((g, i) => {
            const hue = (i * 47) % 360;
            return (
              <Link
                key={g.mal_id}
                href={`/browse?genre=${g.mal_id}`}
                className="rounded-full px-4 py-2 text-sm font-semibold border transition-transform hover:scale-105"
                style={{
                  color: `hsl(${hue} 80% 72%)`,
                  backgroundColor: `hsl(${hue} 70% 50% / 0.12)`,
                  borderColor: `hsl(${hue} 70% 55% / 0.35)`,
                }}
              >
                {g.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
