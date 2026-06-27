"use client";

export const runtime = "edge";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Info, Server, Play, ChevronLeft, ChevronRight,
  Star, Calendar, Film, List, Download, AlertCircle, Languages, Mic,
} from "lucide-react";
import Layout from "@/components/Layout";
import AnimeCard from "@/components/AnimeCard";
import AnimeComments from "@/components/AnimeComments";
import AnimeCharacters from "@/components/AnimeCharacters";
import RelatedAnime from "@/components/RelatedAnime";
import ShareButton from "@/components/ShareButton";
import ShortLinks from "@/components/ShortLinks";
import PopularLeaderboard from "@/components/PopularLeaderboard";
import ReportButton from "@/components/ReportButton";
import { useAnimeById, useAnimeEpisodes, useAnimeRecommendations } from "@/hooks/useAnime";
import { getDisplayTitle } from "@/lib/jikan";
import { parseSlugId, makeAnimeSlug } from "@/lib/slug";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/hooks/useAuth";
import { useEpisodeStreams } from "@/hooks/useStreams";

type AudioType = "sub" | "dub";

const DEMO_VIDEO =
  "https://www.youtube.com/embed/videoseries?list=PLLY8MJl5GiHzC2sB-tEdaaavQ85_y1bL6";

const EPISODES_PER_PAGE = 50;

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SERVICE_LABELS: Record<string, string> = {
  upfiles: "UpFiles",
  filepress: "FilePress",
  gofile: "GoFile",
  mixdrop: "MixDrop",
  telegram: "Telegram",
  tg_cc: "TG Backup",
  pixeldrain: "PixelDrain",
  ddownload: "DDownload",
  abyss: "Abyss",
  turboviplay: "TurboVid",
  anonfiles: "AnonFiles",
};
const label = (s: string) =>
  SERVICE_LABELS[s] ||
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function WatchContent() {
  const params = useParams<{ id: string }>();
  const animeId = parseSlugId(params.id).id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToHistory } = useWatchHistory();

  const initialEp = Number(searchParams.get("ep")) || 1;
  const [currentEp, setCurrentEp] = useState(initialEp);
  const [audio, setAudio] = useState<AudioType>("sub");
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [epPage, setEpPage] = useState(1);

  const { data: animeData, isLoading } = useAnimeById(animeId);
  const { data: episodesData } = useAnimeEpisodes(animeId, 1);
  const { data: recsData } = useAnimeRecommendations(animeId);
  const { data: streams = [], isLoading: streamsLoading } = useEpisodeStreams(animeId, currentEp);

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const totalEps = anime?.episodes || episodes.length || 12;
  const recommendations = recsData?.data?.slice(0, 12) || [];
  const slug = useMemo(() => (anime ? slugify(anime.title) : ""), [anime]);

  const filteredStreams = useMemo(
    () => streams.filter((s) => s.category === audio),
    [streams, audio],
  );

  useEffect(() => {
    if (filteredStreams.length > 0) {
      if (!filteredStreams.find((s) => s.id === activeServerId)) {
        const preferred =
          filteredStreams.find((s) => /turbo/i.test(s.service_name)) ||
          filteredStreams.find((s) => /vidara/i.test(s.service_name)) ||
          filteredStreams.find((s) => /abyss/i.test(s.service_name)) ||
          filteredStreams[0];
        setActiveServerId(preferred.id);
      }
    } else {
      setActiveServerId(null);
    }
  }, [filteredStreams, activeServerId]);

  const activeStream = filteredStreams.find((s) => s.id === activeServerId);
  const fallbackEmbed = useMemo(() => {
    if (!slug) return DEMO_VIDEO;
    return `https://www.youtube.com/embed/?listType=search&list=${encodeURIComponent(
      `${slug.replace(/-/g, " ")} episode ${currentEp} ${audio === "dub" ? "english dub" : "english sub"}`,
    )}`;
  }, [slug, currentEp, audio]);
  const embedUrl = activeStream?.embed_url || activeStream?.service_url || fallbackEmbed;

  const [iframeLoading, setIframeLoading] = useState(true);
  useEffect(() => {
    setIframeLoading(true);
    const t = setTimeout(() => setIframeLoading(false), 10000);
    return () => clearTimeout(t);
  }, [embedUrl]);

  useEffect(() => {
    const page = Math.ceil(currentEp / EPISODES_PER_PAGE);
    setEpPage(page || 1);
  }, [currentEp]);

  const updateEp = (n: number) => {
    setCurrentEp(n);
    router.replace(`?ep=${n}`, { scroll: false });
    if (user && anime) {
      addToHistory.mutate({
        anime_id: anime.mal_id,
        anime_title: getDisplayTitle(anime),
        anime_image: anime.images.webp.large_image_url,
        episode_number: n,
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil(totalEps / EPISODES_PER_PAGE));
  const pageStart = (epPage - 1) * EPISODES_PER_PAGE + 1;
  const pageEnd = Math.min(epPage * EPISODES_PER_PAGE, totalEps);
  const pageEpisodes = useMemo(
    () => Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i),
    [pageStart, pageEnd],
  );

  const availableAudio = useMemo(() => {
    const set = new Set(streams.map((s) => s.category));
    return ["sub", "dub"].filter((a) => set.has(a as AudioType)) as AudioType[];
  }, [streams]);

  if (isLoading || !anime) {
    return (
      <Layout>
        <div className="pt-16">
          <div className="aspect-video w-full bg-card animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full bg-black"
        >
          <div className="aspect-video w-full max-h-[80vh] mx-auto bg-black relative">
            {iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-xs text-muted-foreground">
                  Loading {activeStream ? label(activeStream.service_name) : "player"}…
                </p>
              </div>
            )}
            <iframe
              key={embedUrl}
              src={embedUrl}
              onLoad={() => setIframeLoading(false)}
              className="w-full h-full block"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer"
              title={`Watch ${getDisplayTitle(anime)} Ep ${currentEp}`}
            />
          </div>
        </motion.div>

        <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 min-w-0">
            <Link
              href={`/anime/${makeAnimeSlug(getDisplayTitle(anime), animeId)}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-secondary hover:bg-surface-hover px-2.5 py-1.5 text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-xs sm:text-sm md:text-base truncate leading-tight">
                {getDisplayTitle(anime)}
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                Episode {currentEp}
                {anime.episodes ? ` of ${anime.episodes}` : ""}
                {activeStream && ` · ${label(activeStream.service_name)} · ${activeStream.quality}`}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <ShareButton
                variant="icon"
                title={`${getDisplayTitle(anime)} — Episode ${currentEp}`}
                text={`Watch ${getDisplayTitle(anime)} Episode ${currentEp} on ApexAnime`}
                className="p-1.5"
              />
              <button
                onClick={() => currentEp > 1 && updateEp(currentEp - 1)}
                disabled={currentEp <= 1}
                className="p-1.5 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => currentEp < totalEps && updateEp(currentEp + 1)}
                disabled={currentEp >= totalEps}
                className="p-1.5 rounded-lg bg-secondary hover:bg-surface-hover disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 max-w-6xl">
        <div className="rounded-xl bg-card border border-border p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground shrink-0">
              Audio
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {(["sub", "dub"] as const).map((a) => {
                const available = availableAudio.length === 0 || availableAudio.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => setAudio(a)}
                    disabled={!available && availableAudio.length > 0}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium uppercase transition-all inline-flex items-center justify-center gap-1.5 ${
                      audio === a
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    } disabled:opacity-40`}
                  >
                    {a === "sub" ? <Languages className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground shrink-0 inline-flex items-center gap-1.5 pt-1">
              <Server className="h-3.5 w-3.5" /> Servers
            </span>
            <div className="flex flex-wrap gap-2 min-w-0">
              {streamsLoading ? (
                <div className="text-xs text-muted-foreground">Loading servers…</div>
              ) : filteredStreams.length > 0 ? (
                filteredStreams.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveServerId(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border whitespace-nowrap ${
                      activeServerId === s.id
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label(s.service_name)} · {s.quality}
                  </button>
                ))
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No {audio.toUpperCase()} servers yet — showing fallback search.
                </div>
              )}
            </div>
          </div>
          {activeStream && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                If one player fails, switch server to Vidara, then TurboVid, then Abyss.
              </p>
              <div className="flex items-center gap-1.5">
                <ReportButton animeId={animeId} animeTitle={getDisplayTitle(anime)} episodeNumber={currentEp} />
              </div>
            </div>
          )}
        </div>

        <section className="rounded-xl bg-card border border-border p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Download Episode {currentEp}
            </h2>
            <Link
              href={`/download?id=${animeId}&ep=${currentEp}&title=${encodeURIComponent(getDisplayTitle(anime))}`}
              className="text-[11px] sm:text-xs text-primary hover:underline whitespace-nowrap"
            >
              Full download hub →
            </Link>
          </div>
          <ShortLinks malId={animeId} episode={currentEp} compact />
          <p className="mt-3 text-[11px] text-muted-foreground">
            Links open on third-party shortener pages. We don't host or control these files.
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Episodes
            </h2>
            <span className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
              {pageStart}-{pageEnd} / {totalEps}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setEpPage(p)}
                  className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    epPage === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {(p - 1) * EPISODES_PER_PAGE + 1}-{Math.min(p * EPISODES_PER_PAGE, totalEps)}
                </button>
              ))}
            </div>
          )}

          {totalEps > 40 ? (
            <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card/40 p-2 sm:p-3">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
                {pageEpisodes.map((n) => (
                  <button
                    key={n}
                    onClick={() => updateEp(n)}
                    className={`aspect-square rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      currentEp === n
                        ? "bg-primary text-primary-foreground scale-105 shadow"
                        : "bg-secondary text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto rounded-xl border border-border bg-card/40 p-2 sm:p-3 space-y-2">
              {pageEpisodes.map((n) => {
                const epInfo = episodes.find((e) => e.mal_id === n);
                const active = currentEp === n;
                return (
                  <button
                    key={n}
                    onClick={() => updateEp(n)}
                    className={`w-full flex items-center gap-3 rounded-lg p-2.5 sm:p-3 text-left transition-all border ${
                      active
                        ? "bg-primary/15 border-primary/40"
                        : "bg-card border-border hover:bg-surface-hover"
                    }`}
                  >
                    <div className={`shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
                      active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {epInfo?.title || `Episode ${n}`}
                      </p>
                      {epInfo?.aired && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(epInfo.aired).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {active && <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-card border border-border p-3 sm:p-4 md:p-5">
          <div className="flex gap-3 sm:gap-4">
            <img
              src={anime.images.webp.large_image_url}
              alt={getDisplayTitle(anime)}
              className="w-16 sm:w-20 md:w-28 rounded-lg shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base md:text-lg line-clamp-2">{getDisplayTitle(anime)}</h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
                {anime.score && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {anime.score}
                  </span>
                )}
                {anime.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {anime.year}
                  </span>
                )}
                {anime.type && <span>{anime.type}</span>}
                {anime.status && <span className="truncate">{anime.status}</span>}
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mt-2">
                {anime.synopsis}
              </p>
              <button
                onClick={() => router.push(`/anime/${makeAnimeSlug(getDisplayTitle(anime), animeId)}`)}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Show full details
              </button>
            </div>
          </div>
        </section>

        <AnimeCharacters animeId={animeId} compact />
        <RelatedAnime animeId={animeId} />
        <AnimeComments animeId={animeId} />

        {recommendations.length > 0 && (
          <section>
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
              <List className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> You Might Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recommendations.map((rec, i) => (
                <AnimeCard key={rec.entry.mal_id} anime={rec.entry as any} index={i} />
              ))}
            </div>
          </section>
        )}

        <PopularLeaderboard variant="block" excludeId={animeId} />
      </div>
    </Layout>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="pt-16">
          <div className="aspect-video w-full bg-card animate-pulse" />
        </div>
      </Layout>
    }>
      <WatchContent />
    </Suspense>
  );
}
