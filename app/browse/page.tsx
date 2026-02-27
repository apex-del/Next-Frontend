"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import SkeletonCard from "@/components/SkeletonCard";
import GenreFilter from "@/components/GenreFilter";
import { useSearchAnime, useGenres } from "@/hooks/useAnime";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "airing", label: "Airing" },
  { value: "complete", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
];

const sortOptions = [
  { value: "", label: "Default" },
  { value: "score", label: "Rating" },
  { value: "start_date", label: "Release Date" },
  { value: "title", label: "Title A-Z" },
  { value: "popularity", label: "Popularity" },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: genresData } = useGenres();
  const { data, isLoading } = useSearchAnime(
    debouncedQuery,
    page,
    selectedGenre,
    status,
    sort || undefined,
    sort ? "desc" : undefined
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const genres = genresData?.data || [];
  const results = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Browse Anime
            </h1>
            <p className="text-muted-foreground">
              Discover and download your favorite anime
            </p>
          </motion.div>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime by title..."
                className="w-full rounded-lg bg-card border border-border pl-10 pr-10 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 font-medium transition-all ${
                filtersOpen
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 space-y-4 rounded-lg bg-card border border-border p-4"
            >
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-8">
            <GenreFilter
              genres={genres}
              selected={selectedGenre}
              onSelect={(id) => {
                setSelectedGenre(id);
                setPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {debouncedQuery
                  ? `Results for "${debouncedQuery}"`
                  : "Showing all anime"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((anime, i) => (
                  <AnimeCard key={anime.mal_id} anime={anime} index={i} />
                ))}
              </div>

              {pagination && pagination.last_visible_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {page} of {pagination.last_visible_page}
                  </span>
                  <button
                    disabled={!pagination.has_next_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No anime found</h3>
              <p className="text-muted-foreground">
                Try a different search term or adjust your filters
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="h-[400px] bg-card animate-pulse" />
          </div>
        </div>
      </Layout>
    }>
      <BrowseContent />
    </Suspense>
  );
}
