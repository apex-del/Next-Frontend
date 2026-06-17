const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "";
const EXT_FALLBACK_URL = process.env.NEXT_PUBLIC_EXT_SUPABASE_URL || "https://fzrpquslqktavfqbmccu.supabase.co";
const EXT_FALLBACK_KEY = process.env.NEXT_PUBLIC_EXT_SUPABASE_KEY || "sb_publishable_1Mj9H6h54_sJqKdTCHjLkQ_bxid-IGr";

export interface StreamLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: "sub" | "dub";
  service_name: string;
  service_url: string;
  embed_url: string | null;
  status: string;
}

export interface DownloadLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: string;
  service_name: string;
  service_url: string;
  status: string;
  link_type?: string;
}

export interface ShortLink {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: string;
  service_name: string;
  original_url: string;
  short_url: string;
  short_service: "cuty" | "exe" | "gplinks" | string;
  link_type: string;
  status: string;
}

export interface ExtEpisode {
  episode_number: number;
  title: string | null;
  title_english: string | null;
  aired_string: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  thumbnail: string | null;
}

const EMBED_HOSTS = new Set(["vidara", "turbovid", "turboviplay", "abyss"]);
const STREAM_PRIORITY: Record<string, number> = { vidara: 0, turbovid: 1, abyss: 2 };

function normalizeServiceName(service: string) {
  const s = service.toLowerCase().trim();
  if (s === "turboviplay") return "turbovid";
  return s;
}

function normalizePlayerUrl(url?: string | null) {
  const value = (url || "").trim();
  if (!value) return "";
  return value.replace(/^https:\/\/vidaraa\.cc\//i, "https://vidara.to/");
}

async function apiFetch(table: string, params: URLSearchParams): Promise<any[]> {
  if (WORKER_URL) {
    try {
      const res = await fetch(`${WORKER_URL}/api/ext/${table}?${params}`);
      if (res.ok) return res.json();
    } catch {}
  }
  try {
    const headers = { apikey: EXT_FALLBACK_KEY, Authorization: `Bearer ${EXT_FALLBACK_KEY}` };
    const res = await fetch(`${EXT_FALLBACK_URL}/rest/v1/${table}?${params}`, { headers });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchStreams(malId: number, episode?: number): Promise<StreamLink[]> {
  const p = new URLSearchParams({ select: "*", mal_id: `eq.${malId}`, status: "eq.active", order: "service_name.asc" });
  if (episode != null) p.set("episode_number", `eq.${episode}`);
  const rows: StreamLink[] = await apiFetch("streaming_urls", p);
  const allDownloads = await fetchDownloads(malId, episode);
  const uploadStreams: StreamLink[] = allDownloads
    .filter(
      (u) =>
        u.status === "completed" &&
        (u.link_type ?? "both") !== "download" &&
        EMBED_HOSTS.has(normalizeServiceName(u.service_name))
    )
    .map((u) => ({
      id: `upload-${u.id}`,
      mal_id: u.mal_id,
      episode_number: u.episode_number,
      quality: u.quality,
      category: (u.category === "dub" ? "dub" : "sub") as "sub" | "dub",
      service_name: normalizeServiceName(u.service_name),
      service_url: normalizePlayerUrl(u.service_url),
      embed_url: normalizePlayerUrl(u.service_url),
      status: "active",
    }));
  const seen = new Set<string>();
  return [...rows, ...uploadStreams].filter((s) => {
    s.service_name = normalizeServiceName(s.service_name);
    s.embed_url = normalizePlayerUrl(s.embed_url || s.service_url);
    s.service_url = normalizePlayerUrl(s.service_url || s.embed_url);
    const url = (s.embed_url || s.service_url || "").trim();
    if (!url) return false;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  }).sort((a, b) => (STREAM_PRIORITY[a.service_name] ?? 99) - (STREAM_PRIORITY[b.service_name] ?? 99));
}

export async function fetchDownloads(malId: number, episode?: number): Promise<DownloadLink[]> {
  const p = new URLSearchParams({ select: "*", mal_id: `eq.${malId}`, order: "service_name.asc" });
  if (episode != null) p.set("episode_number", `eq.${episode}`);
  return apiFetch("uploads", p);
}

export async function fetchShortLinks(malId: number, episode?: number): Promise<ShortLink[]> {
  const p = new URLSearchParams({ select: "*", mal_id: `eq.${malId}`, status: "eq.completed", order: "service_name.asc" });
  if (episode != null) p.set("episode_number", `eq.${episode}`);
  return apiFetch("shortened_urls", p);
}

export async function fetchExtEpisodes(malId: number): Promise<ExtEpisode[]> {
  const p = new URLSearchParams({
    select: "episode_number,title,title_english,aired_string,score,filler,recap,thumbnail",
    anime_mal_id: `eq.${malId}`,
    order: "episode_number.asc",
  });
  return apiFetch("episodes", p);
}
