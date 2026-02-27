"use client";

import { Play } from "lucide-react";
import { useState } from "react";

interface Props {
  youtubeId: string | null;
  title: string;
}

export default function AnimeTrailer({ youtubeId, title }: Props) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeId) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        <Play className="h-5 w-5 text-primary" />
        Trailer
      </h2>
      <div className="relative rounded-xl overflow-hidden border border-border aspect-video max-w-3xl">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
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
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Trailer thumbnail"
              className="w-full h-full object-cover"
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
