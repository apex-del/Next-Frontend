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
    <div className="flex items-center gap-4 rounded-lg bg-card border border-border p-4 transition-all hover:bg-surface-hover hover:border-primary/20 group">
      {/* Episode Number */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary font-bold text-lg">
        {episode.mal_id}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {episode.title || `Episode ${episode.mal_id}`}
        </h4>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
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
