"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";

export default function Schedule() {
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [selectedDay, setSelectedDay] = useState(today);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", selectedDay],
    queryFn: async () => {
      const res = await fetch(`${WORKER_URL}/api/schedules?filter=${selectedDay}&limit=24`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const animeList = data?.data || [];

  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
              <CalendarDays className="h-8 w-8 text-primary" />
              Airing Schedule
            </h1>
            <p className="text-muted-foreground">See what&apos;s airing each day of the week</p>
          </motion.div>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  selectedDay === day
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : animeList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animeList.map((anime: any, i: number) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">No anime scheduled</h3>
              <p className="text-muted-foreground">Try selecting a different day</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
