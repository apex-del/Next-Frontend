"use client";

import { useState } from "react";
import { Award, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Link from "next/link";

const categories = [
  { key: "anime", label: "Top Anime", icon: Star },
  { key: "manga", label: "Top Manga", icon: Award },
  { key: "characters", label: "Top Characters", icon: Users },
] as const;

const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";

export default function Leaderboard() {
  const [category, setCategory] = useState<string>("anime");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", category, page],
    queryFn: async () => {
      const endpoint = category === "characters"
        ? `${WORKER_URL}/api/top/characters?page=${page}&limit=25`
        : `${WORKER_URL}/api/top/${category}?page=${page}&limit=25`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <Award className="inline h-6 w-6 text-primary mr-2" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mb-6">Global rankings across anime, manga, and characters</p>
        </motion.div>

        <div className="flex gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategory(cat.key); setPage(1); }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                category === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any, i: number) => {
              const rank = (page - 1) * 25 + i + 1;
              const isCharacter = category === "characters";
              const title = isCharacter ? item.name : (item.title_english || item.title);
              const image = item.images?.webp?.image_url || item.images?.jpg?.image_url;
              const score = isCharacter ? item.favorites : item.score;
              const link = isCharacter ? null : `/anime/${item.mal_id}`;

              return (
                <motion.div
                  key={item.mal_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div className="flex items-center gap-4 rounded-lg bg-card border border-border p-3 hover:bg-surface-hover transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                      rank <= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      #{rank}
                    </div>
                    <img src={image} alt={title} className="h-12 w-10 rounded object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      {link ? (
                        <Link href={link} className="text-sm font-medium hover:text-primary transition-colors truncate block">{title}</Link>
                      ) : (
                        <span className="text-sm font-medium truncate block">{title}</span>
                      )}
                      {!isCharacter && item.type && (
                        <span className="text-xs text-muted-foreground">{item.type}  {item.episodes || "?"} eps</span>
                      )}
                      {isCharacter && item.name_kanji && (
                        <span className="text-xs text-muted-foreground">{item.name_kanji}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCharacter ? <Users className="h-4 w-4 text-primary" /> : <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                      <span className="text-sm font-bold">{isCharacter ? (score || 0).toLocaleString() : score || "N/A"}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {pagination && pagination.last_visible_page > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors">Previous</button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {pagination.last_visible_page}</span>
            <button disabled={!pagination.has_next_page} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 hover:bg-surface-hover transition-colors">Next</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
