"use client";

import { useState, useCallback } from "react";
import { Shuffle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useQuery } from "@tanstack/react-query";
import type { JikanAnime } from "@/lib/jikan";

const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";

async function fetchRandomAnime(): Promise<JikanAnime[]> {
  const results: JikanAnime[] = [];
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 350));
    const res = await fetch(`${WORKER_URL}/api/random/anime`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) results.push(json.data);
    }
  }
  return results;
}

export default function RandomAnime() {
  const [key, setKey] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ["random-anime", key],
    queryFn: fetchRandomAnime,
    staleTime: 0,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
              <Shuffle className="inline h-6 w-6 text-primary mr-2" />
              Random Anime
            </h1>
            <p className="text-muted-foreground text-sm">Discover something new  hit shuffle!</p>
          </div>
          <button
            onClick={() => setKey((k) => k + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Shuffle
          </button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.map((anime, i) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={i} />
              ))}
        </div>
      </div>
    </Layout>
  );
}
