"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAniListMedia } from "@/lib/anilist";

interface Props {
  youtubeId: string | null;
  title: string;
  malId?: number;
}

export default function AnimeTrailer({ youtubeId, title, malId }: Props) {
  const [playing, setPlaying] = useState(false);

  const { data: fallbackId } = useQuery({
    queryKey: ["anilist-trailer", malId],
    queryFn: async () => {
      if (!malId) return null;
      const m = await getAniListMedia(malId);
      if (m?.trailer?.id && (m.trailer.site === "youtube" || !m.trailer.site)) {
        return m.trailer.id;
      }
      return null;
    },
    enabled: !youtubeId && !!malId,
    staleTime: 30 * 60 * 1000,
  });

  const ytId = youtubeId || fallbackId;
  if (!ytId) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <Play className="h-5 w-5 text-primary" />
        Trailer
      </h2>
      <div className="relative rounded-xl overflow-hidden border border-border aspect-video max-w-3xl">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            title={`${title} Trailer`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group"
          >
            <img
              src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
              alt="Trailer thumbnail"
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-background/40 flex items-center justify-center group-hover:bg-background/20 transition-colors">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="h-7 w-7 text-primary-foreground ml-1" />
              </div>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
