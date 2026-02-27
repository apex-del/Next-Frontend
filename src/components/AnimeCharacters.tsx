"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: { webp?: { image_url: string }; jpg: { image_url: string } };
  };
  role: string;
  voice_actors: Array<{
    person: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
    language: string;
  }>;
}

const CHARACTERS_PER_PAGE = 12;
const WORKER_URL = "https://anime-stream-api.anonymous-0709200.workers.dev";
const JIKAN_API = "https://api.jikan.moe/v4";

export default function AnimeCharacters({ animeId }: { animeId: number }) {
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [page, setPage] = useState(1);

  const apiBase = WORKER_URL;

  const { data, isLoading } = useQuery({
    queryKey: ["anime-characters", animeId],
    queryFn: async () => {
      const endpoint = useWorker 
        ? `/api/anime/${animeId}/characters` 
        : `/anime/${animeId}/characters`;
      const res = await fetch(`${apiBase}${endpoint}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ data: Character[] }>;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  const allCharacters = data?.data || [];
  const displayedCharacters = allCharacters.slice(0, 12);
  const totalPages = Math.ceil(allCharacters.length / CHARACTERS_PER_PAGE);
  const paginatedCharacters = allCharacters.slice(
    (page - 1) * CHARACTERS_PER_PAGE,
    page * CHARACTERS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (displayedCharacters.length === 0) return null;

  const japaneseVA = (c: Character) =>
    c.voice_actors.find((va) => va.language === "Japanese");

  return (
    <>
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Characters & Voice Actors
          </h2>
          {allCharacters.length > 12 && (
            <button
              onClick={() => { setShowAllOpen(true); setPage(1); }}
              className="text-sm text-primary hover:underline"
            >
              View All →
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayedCharacters.map((c) => {
            const va = japaneseVA(c);
            return (
              <div
                key={c.character.mal_id}
                className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/20 transition-colors"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={c.character.images.webp?.image_url || c.character.images.jpg.image_url}
                    alt={c.character.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-secondary/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {c.role}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold line-clamp-1">{c.character.name}</p>
                  {va && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {va.person.name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Dialog open={showAllOpen} onOpenChange={setShowAllOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              All Characters & Voice Actors
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedCharacters.map((c) => {
                const va = japaneseVA(c);
                return (
                  <div
                    key={c.character.mal_id}
                    className="flex items-start gap-3 rounded-xl bg-card border border-border p-3"
                  >
                    <img
                      src={c.character.images.webp?.image_url || c.character.images.jpg.image_url}
                      alt={c.character.name}
                      className="w-16 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold line-clamp-1">{c.character.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                      {va && (
                        <div className="flex items-center gap-2 mt-2">
                          <img
                            src={va.person.images.jpg.image_url}
                            alt={va.person.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <p className="text-xs text-muted-foreground truncate">{va.person.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg bg-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg bg-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
