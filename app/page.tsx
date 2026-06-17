"use client";

import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import AnimeRow from "@/components/AnimeRow";
import AnimeCard from "@/components/AnimeCard";
import LeaderboardGrid from "@/components/LeaderboardGrid";
import PopularTopGrid from "@/components/PopularTopGrid";
import ContinueWatching from "@/components/ContinueWatching";
import GenreTags from "@/components/GenreTags";
import { useTopAnime, useSeasonNow } from "@/hooks/useAnime";
import type { JikanAnime } from "@/lib/jikan";

function dedup(list: JikanAnime[]): JikanAnime[] {
  const seen = new Set<number>();
  return list.filter((a) => {
    if (seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });
}

function PosterGrid({
  title,
  emoji,
  animeList,
  isLoading,
}: {
  title: string;
  emoji: string;
  animeList: JikanAnime[];
  isLoading?: boolean;
}) {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          {emoji} {title}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {animeList.slice(0, 12).map((a, i) => (
              <AnimeCard key={a.mal_id} anime={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: topData, isLoading: topLoading } = useTopAnime();
  const { data: airingData, isLoading: airingLoading } = useTopAnime("airing");
  const { data: popularData, isLoading: popularLoading } = useTopAnime("bypopularity");
  const { data: seasonData, isLoading: seasonLoading } = useSeasonNow();
  const { data: favoriteData, isLoading: favoriteLoading } = useTopAnime("favorite");

  const heroAnime = topData?.data || [];

  return (
    <Layout>
      {heroAnime.length > 0 && <HeroSection animeList={heroAnime} />}

      {topLoading && (
        <div className="h-[70vh] min-h-[500px] bg-card animate-pulse" />
      )}

      <ContinueWatching />

      <div className="space-y-2 pb-12 pt-4">
        <AnimeRow
          title="🔥 Trending Now"
          animeList={dedup(airingData?.data || [])}
          isLoading={airingLoading}
        />

        <PopularTopGrid
          title="📺 This Season"
          animeList={seasonData?.data || []}
          isLoading={seasonLoading}
        />

        <PopularTopGrid
          title="⭐ Most Popular"
          animeList={popularData?.data || []}
          isLoading={popularLoading}
        />

        <PopularTopGrid
          title="🏆 Top Rated"
          animeList={topData?.data || []}
          isLoading={topLoading}
        />

        <LeaderboardGrid
          title="💖 Fan Favorites"
          animeList={dedup(favoriteData?.data || [])}
          isLoading={favoriteLoading}
        />

        <GenreTags />
      </div>
    </Layout>
  );
}
