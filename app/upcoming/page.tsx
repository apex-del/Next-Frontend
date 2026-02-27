"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";

const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";

export default function Upcoming() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["upcoming-anime", page],
    queryFn: async () => {
      const res = await fetch(
        `${WORKER_URL}/api/seasons/upcoming?page=${page}&limit=24`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const animeList = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <Sparkles className="inline h-6 w-6 text-primary mr-2" />
            Upcoming Anime
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Discover anime coming soon  stay ahead of the next big hit
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.map((anime: any, i: number) => (
              <AnimeCard key={anime.mal_id} anime={anime} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-card border border-border p-8 text-center">
            <p className="text-muted-foreground">No upcoming anime found</p>
          </div>
        )}

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
