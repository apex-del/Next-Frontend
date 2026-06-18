"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Download as DownloadIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ShareButton from "@/components/ShareButton";
import ShortLinks from "@/components/ShortLinks";
import PopularLeaderboard from "@/components/PopularLeaderboard";
import { useEpisodeDownloads, useEpisodeShortLinks } from "@/hooks/useStreams";

const STREAM_HOSTS = new Set(["abyss", "turboviplay", "turbovid", "vidara", "test"]);

function DownloadContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "Unknown Anime";
  const episode = Number(searchParams.get("ep") || "1");
  const animeId = Number(searchParams.get("id") || "0");

  const { data: shortLinks = [] } = useEpisodeShortLinks(animeId, episode);
  const { data: downloads = [], isLoading } = useEpisodeDownloads(animeId, episode);

  const dlLinks = useMemo(
    () =>
      downloads.filter(
        (d: any) =>
          (d.link_type ?? "download") !== "embed" &&
          !STREAM_HOSTS.has((d.service_name || "").toLowerCase())
      ),
    [downloads]
  );
  const hasShort = shortLinks.some((l) => (l.link_type ?? "download") !== "embed");

  const searchQuery = `${title} Episode ${episode} download`;

  return (
    <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href={animeId ? `/anime/${animeId}` : "/"}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Anime
        </Link>
        <ShareButton
          title={`${title} — Episode ${episode} download`}
          text={`Download ${title} Episode ${episode} on ApexAnime`}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          <DownloadIcon className="inline h-6 w-6 text-primary mr-2" />
          Download Episode {episode}
        </h1>
        <p className="text-muted-foreground line-clamp-2">{title}</p>
      </motion.div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1.5">
            <p className="font-bold text-destructive">Safety first</p>
            <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />Use a <strong className="text-foreground">VPN</strong> and an <strong className="text-foreground">Ad Blocker</strong> on third-party hosts.</p>
            <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />Shortener pages (Cuty / Exe / GPLinks) show ads — wait for the <strong className="text-foreground">Continue</strong> button.</p>
            <p><Shield className="inline h-3.5 w-3.5 text-primary mr-1" />Never download <strong className="text-foreground">.exe</strong> files — only .mkv / .mp4. We don't host these files.</p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-6">
        <h2 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
          <DownloadIcon className="h-4 w-4 text-primary" /> Download Links
        </h2>
        <ShortLinks malId={animeId} episode={episode} />
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading mirrors...
        </div>
      ) : !hasShort && dlLinks.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="text-sm font-bold mb-3 text-muted-foreground">Direct mirrors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dlLinks.map((d: any, i: number) => (
              <motion.a
                key={d.id}
                href={d.service_url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 p-4 hover:border-primary/40 hover:bg-surface-hover transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate group-hover:text-primary">
                    {d.service_name?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Unknown"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                    <span className="uppercase">{d.quality || "all"}</span>
                    {d.category && <span>· {d.category.toUpperCase()}</span>}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
              </motion.a>
            ))}
          </div>
        </section>
      ) : !hasShort && dlLinks.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            No download links yet for Episode {episode}. Try a Google search:
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Search on Google
          </a>
        </div>
      ) : null}

      <div className="mt-8">
        <PopularLeaderboard variant="block" excludeId={animeId} />
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <DownloadContent />
      </Suspense>
    </Layout>
  );
}
