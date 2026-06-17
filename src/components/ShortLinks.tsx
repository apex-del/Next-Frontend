"use client";

import { useMemo, useState, useEffect } from "react";
import { ExternalLink, Link2, Loader2, AlertCircle, ShieldCheck, Server, Copy, Check } from "lucide-react";
import { useEpisodeShortLinks } from "@/hooks/useStreams";
import type { ShortLink } from "@/lib/externalDb";

const HOST_LABELS: Record<string, string> = {
  upfiles: "UpFiles",
  filepress: "FilePress",
  gofile: "GoFile",
  mixdrop: "MixDrop",
  telegram: "Telegram",
  tg_cc: "Telegram (Backup)",
  pixeldrain: "PixelDrain",
  ddownload: "DDownload",
  anonfiles: "AnonFiles",
};
const hostLabel = (s: string) =>
  HOST_LABELS[s] || s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SHORTENER_LABELS: Record<string, string> = {
  cuty: "Cuty",
  exe: "Exe.io",
  gplinks: "GPLinks",
};
const shortLabel = (s: string) => SHORTENER_LABELS[s] || s.replace(/\b\w/g, (c) => c.toUpperCase());

const STREAM_HOSTS = new Set(["abyss", "turboviplay", "turbovid", "vidara", "test"]);

const normQuality = (q?: string) => (q || "all").toLowerCase().replace(/\s+/g, "");

interface Props {
  malId: number;
  episode: number;
  compact?: boolean;
}

export default function ShortLinks({ malId, episode, compact }: Props) {
  const { data: links = [], isLoading } = useEpisodeShortLinks(malId, episode);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const dlLinks = useMemo(
    () =>
      links.filter(
        (l) =>
          (l.link_type ?? "download") !== "embed" &&
          !STREAM_HOSTS.has((l.service_name || "").toLowerCase())
      ),
    [links]
  );

  const shorteners = useMemo(() => {
    const set = new Set<string>();
    dlLinks.forEach((l) => set.add(l.short_service));
    return Array.from(set).sort();
  }, [dlLinks]);

  const [activeShort, setActiveShort] = useState<string>("");
  const [activeHost, setActiveHost] = useState("all");
  const [activeQuality, setActiveQuality] = useState("all");

  useEffect(() => {
    if (shorteners.length && !shorteners.includes(activeShort)) {
      setActiveShort(shorteners[0]);
    }
  }, [shorteners, activeShort]);

  const byShort = useMemo(
    () => dlLinks.filter((l) => l.short_service === activeShort),
    [dlLinks, activeShort]
  );

  const hostKeys = useMemo(() => {
    const set = new Set<string>();
    byShort.forEach((l) => set.add(l.service_name));
    return Array.from(set).sort();
  }, [byShort]);

  useEffect(() => {
    if (activeHost !== "all" && !hostKeys.includes(activeHost)) setActiveHost("all");
  }, [hostKeys, activeHost]);

  const byHost = useMemo(
    () => byShort.filter((l) => activeHost === "all" || l.service_name === activeHost),
    [byShort, activeHost]
  );

  const qualityKeys = useMemo(() => {
    const set = new Set<string>();
    byHost.forEach((l) => set.add(normQuality(l.quality)));
    return Array.from(set).sort((a, b) =>
      (b.match(/\d+/)?.[0] ?? "0").localeCompare(a.match(/\d+/)?.[0] ?? "0", undefined, { numeric: true })
    );
  }, [byHost]);

  useEffect(() => {
    if (activeQuality !== "all" && !qualityKeys.includes(activeQuality)) setActiveQuality("all");
  }, [qualityKeys, activeQuality]);

  const visible = useMemo(
    () => byHost.filter((l) => activeQuality === "all" || normQuality(l.quality) === activeQuality),
    [byHost, activeQuality]
  );

  const copy = async (l: ShortLink) => {
    try {
      await navigator.clipboard.writeText(l.short_url);
      setCopiedId(l.id);
      setTimeout(() => setCopiedId((c) => (c === l.id ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading download links...
      </div>
    );
  }

  if (dlLinks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <AlertCircle className="h-3.5 w-3.5" /> No shortened download links yet for this episode.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5" /> Shortener service
        </p>
        <div className="flex flex-wrap gap-2">
          {shorteners.map((s) => {
            const count = dlLinks.filter((l) => l.short_service === s).length;
            return (
              <button
                key={s}
                onClick={() => setActiveShort(s)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  activeShort === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {shortLabel(s)}
                <span className="ml-1.5 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {hostKeys.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5" /> Host
          </p>
          <div className="flex flex-wrap gap-2">
            {["all", ...hostKeys].map((h) => (
              <button
                key={h}
                onClick={() => setActiveHost(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeHost === h
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {h === "all" ? "All hosts" : hostLabel(h)}
              </button>
            ))}
          </div>
        </div>
      )}

      {qualityKeys.length > 1 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
            Quality
          </p>
          <div className="flex flex-wrap gap-2">
            {["all", ...qualityKeys].map((q) => (
              <button
                key={q}
                onClick={() => setActiveQuality(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeQuality === q
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {q === "all" ? "All" : q.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-3"} gap-2.5`}>
        {visible.map((l: ShortLink) => (
          <div
            key={l.id}
            className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/50 p-3.5 hover:border-primary/40 hover:bg-surface-hover transition-all"
          >
            <a
              href={l.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1"
            >
              <div className="text-sm font-bold truncate group-hover:text-primary">
                {hostLabel(l.service_name)}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <span className="uppercase">{l.quality || "all"}</span>
                {l.category && <span>· {l.category.toUpperCase()}</span>}
                <span className="inline-flex items-center gap-0.5 text-primary/70">
                  <ShieldCheck className="h-3 w-3" /> via {shortLabel(l.short_service)}
                </span>
              </div>
            </a>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copy(l)}
                aria-label="Copy link"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              >
                {copiedId === l.id ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <a
                href={l.short_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open link"
                className="p-1.5 rounded-lg text-muted-foreground group-hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
