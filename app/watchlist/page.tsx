"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";
import { ListChecks, Trash2, ExternalLink } from "lucide-react";

type Tab = "planning" | "completed";

export default function WatchList() {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [tab, setTab] = useState<Tab>("planning");

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ListChecks className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Sign in to view your Watch List</h2>
          <Link href="/auth" className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const items = favorites || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ListChecks className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-extrabold">Watch List</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {(["planning", "completed"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "planning" && items.length === 0 && (
          <div className="rounded-xl bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">Add anime to your favorites to build your watch list.</p>
          </div>
        )}

        {tab === "planning" && items.length > 0 && (
          <div className="space-y-3">
            {items.map((fav: any) => (
              <div
                key={fav.id}
                className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:border-primary/20 transition-colors"
              >
                <img
                  src={fav.anime_image}
                  alt={fav.anime_title}
                  className="h-16 w-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${fav.anime_id}`} className="text-sm font-bold hover:text-primary transition-colors line-clamp-1">
                    {fav.anime_title}
                  </Link>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    {fav.anime_type && <span>{fav.anime_type}</span>}
                    {fav.anime_year && <span>  {fav.anime_year}</span>}
                    {fav.anime_score && <span>  {fav.anime_score}</span>}
                  </div>
                </div>
                <Link href={`/anime/${fav.anime_id}`} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => removeFavorite.mutate(fav.anime_id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "completed" && (
          <div className="rounded-xl bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">Track completed anime from your watch history.</p>
            <Link href="/history" className="text-primary text-sm hover:underline mt-2 inline-block">
              Go to History 
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
