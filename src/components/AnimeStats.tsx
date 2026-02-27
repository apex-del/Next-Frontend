"use client";

import { BarChart3, Star, Users, TrendingUp, Award } from "lucide-react";
import type { JikanAnime } from "@/lib/jikan";

export default function AnimeStats({ anime }: { anime: JikanAnime }) {
  const stats = [
    { icon: Star, label: "Score", value: anime.score?.toFixed(1) || "N/A", sub: anime.scored_by ? `${(anime.scored_by / 1000).toFixed(0)}k votes` : undefined },
    { icon: TrendingUp, label: "Rank", value: anime.rank ? `#${anime.rank}` : "N/A" },
    { icon: Users, label: "Members", value: anime.members ? `${(anime.members / 1000).toFixed(0)}k` : "N/A" },
    { icon: Award, label: "Popularity", value: anime.popularity ? `#${anime.popularity}` : "N/A" },
  ];

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-4 text-center">
            <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            {s.sub && <p className="text-[10px] text-muted-foreground">{s.sub}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
