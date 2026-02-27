"use client";

import { useState } from "react";
import { TrendingUp, Trophy, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useTopAnime } from "@/hooks/useAnime";

const tabs = [
  { key: "bypopularity" as const, label: "Most Popular", icon: TrendingUp },
  { key: "" as const, label: "Top Rated", icon: Trophy },
  { key: "airing" as const, label: "Airing Now", icon: Flame },
  { key: "upcoming" as const, label: "Upcoming", icon: Clock },
];

export default function TopCharts() {
  const [filter, setFilter] = useState<"airing" | "upcoming" | "bypopularity" | "favorite" | "">("bypopularity");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTopAnime(filter, page);

  const animeList = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <Trophy className="inline h-6 w-6 text-primary mr-2" />
            Top Charts
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Anime leaderboard rankings</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)
            : animeList.map((anime, i) => (
                <div key={anime.mal_id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                    #{(page - 1) * 20 + i + 1}
                  </div>
                  <AnimeCard anime={anime} index={i} />
                </div>
              ))}
        </div>

        {pagination && pagination.last_visible_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page} of {pagination.last_visible_page}
            </span>
            <button
              disabled={!pagination.has_next_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
