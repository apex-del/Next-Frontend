"use client";

import Link from "next/link";
import { Clock, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export default function HistoryPage() {
  const { user } = useAuth();
  const { history, isLoading, clearHistory, removeFromHistory } = useWatchHistory();

  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 px-4">
          <Clock className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-4">Track your watch progress across episodes</p>
          <Link
            href="/auth"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const groupedHistory = history.reduce((groups: Record<string, any[]>, item: any) => {
    const date = new Date(item.watched_at).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                Watch History
              </h1>
              <p className="text-muted-foreground">{history.length} items</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => clearHistory.mutate()}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-card animate-pulse" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([date, items]: [string, any[]]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                  <div className="space-y-2">
                    {items.map((item: any, i: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 rounded-lg bg-card border border-border p-4 hover:bg-surface-hover transition-colors group"
                      >
                        <Link href={`/anime/${item.anime_id}`} className="shrink-0">
                          <img
                            src={item.anime_image}
                            alt={item.anime_title}
                            className="h-16 w-12 rounded-md object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/anime/${item.anime_id}`} className="hover:text-primary transition-colors">
                            <h4 className="text-sm font-semibold line-clamp-1">{item.anime_title}</h4>
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.episode_title
                              ? `Ep ${item.episode_number}: ${item.episode_title}`
                              : item.episode_number
                              ? `Episode ${item.episode_number}`
                              : "Viewed details"}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(item.watched_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromHistory.mutate(item.id)}
                          className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">No watch history</h3>
              <p className="text-muted-foreground mb-4">Start watching anime to track your progress</p>
              <Link
                href="/browse"
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Browse Anime
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
