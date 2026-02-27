"use client";

import Link from "next/link";
import { Heart, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  if (!user) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 px-4">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Sign in to view favorites</h2>
          <p className="text-muted-foreground mb-4">Save your favorite anime and access them anytime</p>
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

  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              My Favorites
            </h1>
            <p className="text-muted-foreground mb-8">
              {favorites.length} anime saved
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-card animate-pulse" />
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.map((fav: any, i: number) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 card-glow hover:card-glow-hover hover:scale-[1.03]">
                    <Link href={`/anime/${fav.anime_id}`}>
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={fav.anime_image}
                          alt={fav.anime_title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {fav.anime_score && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold">{fav.anime_score}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                          {fav.anime_title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {fav.anime_year && <span>{fav.anime_year}</span>}
                          {fav.anime_type && (
                            <>
                              <span>•</span>
                              <span>{fav.anime_type}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFavorite.mutate(fav.anime_id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-4">Browse anime and click the heart to save</p>
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
