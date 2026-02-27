"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function Studios() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["producers", page],
    queryFn: async () => {
      const res = await fetch(
        `https://api.jikan.moe/v4/producers?page=${page}&limit=24&order_by=favorites&sort=desc`
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const studios = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">
            <Building2 className="inline h-6 w-6 text-primary mr-2" />
            Studios & Producers
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Explore anime by studio and production company
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {studios.map((studio: any, i: number) => {
              const image =
                studio.images?.jpg?.image_url;
              return (
                <motion.div
                  key={studio.mal_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/browse?producer=${studio.mal_id}`}
                    className="group block rounded-xl bg-card border border-border p-4 hover:border-primary/30 hover:bg-surface-hover transition-all text-center"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={studio.titles?.[0]?.title || studio.name}
                        className="h-16 w-auto mx-auto mb-3 object-contain"
                      />
                    ) : (
                      <div className="h-16 flex items-center justify-center mb-3">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {studio.titles?.[0]?.title || studio.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {studio.count?.toLocaleString() || 0} anime
                    </p>
                    {studio.favorites > 0 && (
                      <p className="text-xs text-primary mt-0.5">
                         {studio.favorites.toLocaleString()}
                      </p>
                    )}
                  </Link>
                </motion.div>
              );
            })}
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
