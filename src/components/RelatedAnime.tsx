"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { GitBranch } from "lucide-react";

interface Relation {
  relation: string;
  entry: Array<{ mal_id: number; type: string; name: string; url: string }>;
}

interface RelatedAnimeProps {
  animeId: number;
}

const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";
const JIKAN_API = "https://api.jikan.moe/v4";

export default function RelatedAnime({ animeId }: RelatedAnimeProps) {
  const apiBase = WORKER_URL;

  const { data } = useQuery({
    queryKey: ["anime-relations", animeId],
    queryFn: async () => {
      const endpoint = `/api/anime/${animeId}/relations`;
      const res = await fetch(`${apiBase}${endpoint}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ data: Relation[] }>;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  const relations = data?.data || [];
  const animeRelations = relations.filter((r) =>
    r.entry.some((e) => e.type === "anime")
  );

  if (animeRelations.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-primary" />
        Related Anime
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {animeRelations.map((rel, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-4">
            <span className="text-xs font-bold text-primary mb-2 block">{rel.relation}</span>
            {rel.entry
              .filter((e) => e.type === "anime")
              .map((entry) => (
                <Link
                  key={entry.mal_id}
                  href={`/anime/${entry.mal_id}`}
                  className="block text-sm text-foreground hover:text-primary transition-colors py-1"
                >
                  {entry.name}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
