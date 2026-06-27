"use client";

import { Download, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JikanEpisode } from "@/lib/jikan";
import ReportButton from "./ReportButton";

interface EpisodeCardProps {
  episode: JikanEpisode;
  animeTitle: string;
  animeMalId: number;
}

export default function EpisodeCard({
  episode,
  animeTitle,
  animeMalId,
}: EpisodeCardProps) {
  const router = useRouter();

  const handleDownload = () => {
    router.push(`/download?title=${encodeURIComponent(animeTitle)}&ep=${episode.mal_id}&id=${animeMalId}`);
  };

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 rounded-lg bg-card border border-border px-2.5 sm:px-4 py-2.5 sm:py-3 transition-all hover:bg-surface-hover hover:border-primary/20 group">
      {/* Thumbnail with episode number badge */}
      <div className="relative h-[60px] w-[106px] sm:h-[68px] sm:w-[120px] shrink-0 overflow-hidden rounded-lg bg-secondary">
        {episode.thumbnail ? (
          <>
            <img
              src={episode.thumbnail}
              alt={`Episode ${episode.mal_id}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white leading-tight">
              EP {episode.mal_id}
            </span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary font-bold text-xs text-muted-foreground">
            {episode.mal_id}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {episode.title || `Episode ${episode.mal_id}`}
        </h4>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          {episode.aired && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(episode.aired).toLocaleDateString()}
            </span>
          )}
          {episode.filler && (
            <span className="rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-[10px] font-medium">
              Filler
            </span>
          )}
          {episode.recap && (
            <span className="rounded-full bg-yellow-500/20 text-yellow-400 px-2 py-0.5 text-[10px] font-medium">
              Recap
            </span>
          )}
        </div>
      </div>

      {/* Report Button */}
      <ReportButton animeId={animeMalId} animeTitle={animeTitle} episodeNumber={episode.mal_id} />

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="shrink-0 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </button>
    </div>
  );
}
