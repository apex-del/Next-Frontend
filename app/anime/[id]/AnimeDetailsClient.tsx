"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Calendar,
  Film,
  Monitor,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Download,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import EpisodeCard from "@/components/EpisodeCard";
import SkeletonCard from "@/components/SkeletonCard";
import {
  useAnimeById,
  useAnimeEpisodes,
  useAnimeRecommendations,
} from "@/hooks/useAnime";
import {
  getDisplayTitle,
  getBannerImage,
  getStatusColor,
} from "@/lib/jikan";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import AnimeTrailer from "@/components/AnimeTrailer";
import AnimeStats from "@/components/AnimeStats";
import AnimeCharacters from "@/components/AnimeCharacters";
import AnimeComments from "@/components/AnimeComments";
import RelatedAnime from "@/components/RelatedAnime";

interface AnimeDetailsClientProps {
  animeId: number;
}

export default function AnimeDetailsClient({ animeId }: AnimeDetailsClientProps) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [episodePage, setEpisodePage] = useState(1);
  const { user } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const { data: animeData, isLoading } = useAnimeById(animeId);
  const { data: episodesData, isLoading: episodesLoading } =
    useAnimeEpisodes(animeId, episodePage);
  const { data: recsData } = useAnimeRecommendations(animeId);

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-16">
          <div className="h-[50vh] bg-card animate-pulse" />
          <div className="container mx-auto px-4 py-8 space-y-4">
            <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-96 bg-secondary rounded animate-pulse" />
            <div className="h-32 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!animeData?.data) {
    return (
      <Layout>
        <div className="pt-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold mb-2">Anime not found</h2>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </Layout>
    );
  }

  const anime = animeData.data;
  const episodes = episodesData?.data || [];
  const epPagination = episodesData?.pagination;
  const recommendations = recsData?.data?.slice(0, 12) || [];
  const bannerUrl = getBannerImage(anime);

  return (
    <Layout>
      <div className="relative h-[50vh] min-h-[350px]">
        <img
          src={bannerUrl}
          alt={getDisplayTitle(anime)}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 gradient-overlay-right" />

        <div className="absolute top-20 left-4 z-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg glass px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0"
          >
            <img
              src={
                anime.images.webp.large_image_url ||
                anime.images.jpg.large_image_url
              }
              alt={getDisplayTitle(anime)}
              className="w-48 md:w-56 rounded-xl shadow-2xl border border-border mx-auto md:mx-0"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 pt-4 md:pt-8"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl md:text-4xl font-extrabold leading-tight">
                {getDisplayTitle(anime)}
              </h1>
              {user && (
                <button
                  onClick={() =>
                    isFavorite(anime.mal_id)
                      ? removeFavorite.mutate(anime.mal_id)
                      : addFavorite.mutate(anime)
                  }
                  className={`shrink-0 p-2.5 rounded-lg border transition-all ${
                    isFavorite(anime.mal_id)
                      ? "bg-primary/15 border-primary/30 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite(anime.mal_id) ? "fill-primary" : ""}`}
                  />
                </button>
              )}
            </div>

            {anime.title_japanese && (
              <p className="text-sm text-muted-foreground mb-3">
                {anime.title_japanese}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {anime.score && (
                <div className="flex items-center gap-1 rounded-lg bg-primary/15 border border-primary/20 px-3 py-1.5">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold">{anime.score}</span>
                  {anime.scored_by && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({(anime.scored_by / 1000).toFixed(0)}k)
                    </span>
                  )}
                </div>
              )}
              <span
                className={`rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium ${getStatusColor(
                  anime.status
                )}`}
              >
                {anime.status}
              </span>
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                {anime.type}
              </span>
              {anime.rating && (
                <span className="rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                  {anime.rating}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {anime.episodes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Film className="h-4 w-4 text-primary" />
                  <span>{anime.episodes} Episodes</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{anime.year}</span>
                </div>
              )}
              {anime.studios?.[0] && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span>{anime.studios[0].name}</span>
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4 text-primary" />
                  <span>{anime.duration}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {anime.genres.map((g) => (
                <Link
                  key={g.mal_id}
                  href={`/browse?genre=${g.mal_id}`}
                  className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  {g.name}
                </Link>
              ))}
              {anime.themes?.map((t) => (
                <span
                  key={t.mal_id}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                >
                  {t.name}
                </span>
              ))}
            </div>

            {anime.synopsis && (
              <div className="mb-6">
                <p
                  className={`text-sm text-muted-foreground leading-relaxed ${
                    !synopsisExpanded ? "line-clamp-4" : ""
                  }`}
                >
                  {anime.synopsis}
                </p>
                <button
                  onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                  className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {synopsisExpanded ? (
                    <>
                      Show less <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Read more <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Episodes
          </h2>

          {episodesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-card animate-pulse"
                />
              ))}
            </div>
          ) : episodes.length > 0 ? (
            <>
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <EpisodeCard
                    key={ep.mal_id}
                    episode={ep}
                    animeTitle={getDisplayTitle(anime)}
                    animeMalId={anime.mal_id}
                  />
                ))}
              </div>

              {epPagination && epPagination.last_visible_page > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    disabled={episodePage <= 1}
                    onClick={() => setEpisodePage((p) => p - 1)}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {episodePage} of {epPagination.last_visible_page}
                  </span>
                  <button
                    disabled={!epPagination.has_next_page}
                    onClick={() => setEpisodePage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg bg-card border border-border p-8 text-center">
              <p className="text-muted-foreground">
                No episodes available yet
              </p>
            </div>
          )}
        </motion.section>

        <AnimeTrailer youtubeId={anime.trailer?.youtube_id} title={getDisplayTitle(anime)} />
        <AnimeCharacters animeId={anime.mal_id} />
        <AnimeStats anime={anime} />

        <RelatedAnime animeId={anime.mal_id} />

        <AnimeComments animeId={animeId} />

        {recommendations.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map((rec, i) => (
                <AnimeCard
                  key={rec.entry.mal_id}
                  anime={rec.entry as any}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
