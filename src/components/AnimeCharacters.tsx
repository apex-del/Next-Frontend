"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Mic, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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

const PAGE_SIZE = 12;

function Pager({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <button onClick={onPrev} disabled={page <= 1} className="p-1.5 rounded-md bg-secondary disabled:opacity-40 hover:bg-surface-hover">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span className="px-1.5">{page}/{totalPages}</span>
      <button onClick={onNext} disabled={page >= totalPages} className="p-1.5 rounded-md bg-secondary disabled:opacity-40 hover:bg-surface-hover">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function AnimeCharacters({ animeId, compact }: { animeId: number; compact?: boolean }) {
  const [charPage, setCharPage] = useState(1);
  const [vaPage, setVaPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["anime-characters", animeId],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ data: Character[] }>;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!animeId,
  });

  const all = data?.data ?? [];

  const characters = useMemo(
    () => [...all].sort((a, b) => (a.role === "Main" ? -1 : 1) - (b.role === "Main" ? -1 : 1)),
    [all]
  );

  const voiceActors = useMemo(() => {
    const map = new Map<number, { person: Character["voice_actors"][0]["person"]; language: string; chars: Set<string> }>();
    all.forEach((c) => {
      const va = c.voice_actors.find((v) => v.language === "Japanese") || c.voice_actors[0];
      if (!va) return;
      const existing = map.get(va.person.mal_id);
      if (existing) existing.chars.add(c.character.name);
      else map.set(va.person.mal_id, { person: va.person, language: va.language, chars: new Set([c.character.name]) });
    });
    return Array.from(map.values());
  }, [all]);

  const charTotal = Math.max(1, Math.ceil(characters.length / PAGE_SIZE));
  const vaTotal = Math.max(1, Math.ceil(voiceActors.length / PAGE_SIZE));
  const charItems = characters.slice((charPage - 1) * PAGE_SIZE, charPage * PAGE_SIZE);
  const vaItems = voiceActors.slice((vaPage - 1) * PAGE_SIZE, vaPage * PAGE_SIZE);

  if (isLoading) {
    return (
      <section className={compact ? "mt-6" : "mt-10"}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (all.length === 0) return null;
  const headingSize = compact ? "text-base sm:text-lg" : "text-xl md:text-2xl";

  return (
    <>
      <section className={compact ? "mt-6" : "mt-10"}>
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <h2 className={`font-bold flex items-center gap-2 ${headingSize}`}>
            <Users className={compact ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
            Characters
            <span className="text-xs text-muted-foreground font-normal">({characters.length})</span>
          </h2>
          <Pager page={charPage} totalPages={charTotal} onPrev={() => setCharPage((p) => Math.max(1, p - 1))} onNext={() => setCharPage((p) => Math.min(charTotal, p + 1))} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {charItems.map((c) => (
            <Link key={c.character.mal_id} href={`/character/${c.character.mal_id}`} className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors">
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
                <p className="text-xs font-bold line-clamp-2 group-hover:text-primary transition-colors">{c.character.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {voiceActors.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className={`font-bold flex items-center gap-2 ${headingSize}`}>
              <Mic className={compact ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
              Voice Actors
              <span className="text-xs text-muted-foreground font-normal">({voiceActors.length})</span>
            </h2>
            <Pager page={vaPage} totalPages={vaTotal} onPrev={() => setVaPage((p) => Math.max(1, p - 1))} onNext={() => setVaPage((p) => Math.min(vaTotal, p + 1))} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {vaItems.map((va) => (
              <Link key={va.person.mal_id} href={`/person/${va.person.mal_id}`} className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={va.person.images.jpg.image_url}
                    alt={va.person.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {va.language}
                  </span>
                </div>
                <div className="p-2.5 space-y-0.5">
                  <p className="text-xs font-bold line-clamp-1 group-hover:text-primary transition-colors">{va.person.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">as {Array.from(va.chars).join(", ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
