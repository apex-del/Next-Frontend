"use client";

import Link from "next/link";
import Layout from "@/components/Layout";
import { useGenres } from "@/hooks/useAnime";
import { Palette } from "lucide-react";

const genreColors = [
  "from-primary/30 to-primary/5",
  "from-accent/30 to-accent/5",
  "from-destructive/20 to-destructive/5",
  "from-primary/20 to-secondary",
  "from-muted to-card",
];

export default function Genres() {
  const { data, isLoading } = useGenres();
  const genres = data?.data || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Palette className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold">Browse Genres</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {genres.map((genre, i) => (
              <Link
                key={genre.mal_id}
                href={`/browse?genre=${genre.mal_id}`}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${
                  genreColors[i % genreColors.length]
                } border border-border p-5 transition-all hover:scale-[1.03] hover:border-primary/30 hover:card-glow`}
              >
                <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">
                  {genre.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {genre.count.toLocaleString()} titles
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
