const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "";
const OKKUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://okkupxjkocgasztfldak.supabase.co";
const OKKUP_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const FZR_URL = process.env.NEXT_PUBLIC_EXT_SUPABASE_URL || "https://fzrpquslqktavfqbmccu.supabase.co";
const FZR_KEY = process.env.NEXT_PUBLIC_EXT_SUPABASE_KEY || "sb_publishable_1Mj9H6h54_sJqKdTCHjLkQ_bxid-IGr";

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
const STREAM_PRIORITY: Record<string, number> = { vidara: 0, turbovid: 1, abyss: 2, "anikoto-vidplay": 10, "anikoto-hd": 11, "anikoto-vidcloud": 12, "anikoto-unknown": 13 };

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
  // Try OKKUP first
  try {
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/${table}?${params}`, { headers });
    if (res.ok) { const d = await res.json(); if (d?.length) return d; }
  } catch {}
  // Fallback to FZR
  try {
    const headers = { apikey: FZR_KEY };
    const res = await fetch(`${FZR_URL}/rest/v1/${table}?${params}`, { headers });
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

export interface AnikotoStream {
  id: string;
  mal_id: number;
  episode_number: number;
  quality: string;
  category: "sub" | "dub";
  service_name: string;
  service_url: string;
  embed_url: string;
  status: "active";
}

export async function fetchAnikotoEmbeds(
  malId: number,
  episode: number,
  anikotoId?: string
): Promise<AnikotoStream[]> {
  // Step 1: Try Worker proxy first (with caching)
  try {
    const params = new URLSearchParams({
      mal_id: String(malId),
      episode: String(episode),
    });
    if (anikotoId) params.set("anikoto_id", anikotoId);

    if (WORKER_URL) {
      const res = await fetch(`${WORKER_URL}/api/ext/anikoto/embeds?${params}`);
      if (res.ok) {
        const data = await res.json();
        const servers = data?.servers || [];
        const streams: AnikotoStream[] = [];
        for (const srv of servers) {
          streams.push({
            id: `anikoto-${srv.link_id}`,
            mal_id: malId,
            episode_number: episode,
            quality: "1080p",
            category: srv.language as "sub" | "dub",
            service_name: `anikoto-${srv.server_type}`,
            service_url: srv.embed_url,
            embed_url: srv.embed_url,
            status: "active",
          });
        }
        return streams;
      }
    }
  } catch {}

  // Step 2: Direct fallback — lookup show_id from FZR, then use anikototv.to
  try {
    // Lookup show_id from FZR DB (public read)
    const mapRes = await fetch(
      `${FZR_URL}/rest/v1/anime_anikoto_map?mal_id=eq.${malId}&select=show_id`,
      { headers: { apikey: FZR_KEY, Authorization: `Bearer ${FZR_KEY}` } }
    );
    if (!mapRes.ok) return [];
    const rows = await mapRes.json() as { show_id: string }[];
    if (!rows.length || !rows[0].show_id) return [];
    const showId = rows[0].show_id;

    // Get episode data-ids
    const epRes = await fetch(`https://anikototv.to/ajax/episode/list/${showId}`, {
      headers: { "User-Agent": "ApexAnime/1.0", "X-Requested-With": "XMLHttpRequest" },
    });
    if (!epRes.ok) return [];
    const epData = await epRes.json();
    const epHtml = epData?.result || "";
    const epMatch = epHtml.match(
      new RegExp(`data-num="${episode}"[^>]*data-ids="([^"]+)"`, "i")
    );
    if (!epMatch) return [];
    const dataIds = epMatch[1];

    // Get servers
    const srvRes = await fetch(
      `https://anikototv.to/ajax/server/list?servers=${dataIds}`,
      { headers: { "User-Agent": "ApexAnime/1.0", "X-Requested-With": "XMLHttpRequest" } }
    );
    if (!srvRes.ok) return [];
    const srvData = await srvRes.json();
    const srvHtml = srvData?.result || "";

    // Parse servers with language
    const servers: { link_id: string; name: string; language: string }[] = [];
    let curLang = "sub";
    for (const line of srvHtml.split("\n")) {
      const langMatch = line.match(/data-type="(sub|dub)"/i);
      if (langMatch) curLang = langMatch[1];
      const liMatches = line.matchAll(/data-link-id="([^"]+)"[^>]*>([^<]+)/g);
      for (const m of liMatches) {
        servers.push({ link_id: m[1], name: m[2].trim(), language: curLang });
      }
    }
    if (!servers.length) return [];

    // Resolve embed URLs (first 4 servers only to avoid CORS issues)
    const streams: AnikotoStream[] = [];
    for (const srv of servers.slice(0, 4)) {
      try {
        const resolveRes = await fetch(
          `https://anikototv.to/ajax/server?get=${srv.link_id}`,
          { headers: { "User-Agent": "ApexAnime/1.0", "X-Requested-With": "XMLHttpRequest" } }
        );
        if (!resolveRes.ok) continue;
        const resolveData = await resolveRes.json();
        const embedUrl = resolveData?.result?.url;
        if (!embedUrl) continue;

        let serverType = "unknown";
        if (/vidtube\.site/i.test(embedUrl)) serverType = "vidplay";
        else if (/megaplay\.buzz/i.test(embedUrl)) serverType = "hd";
        else if (/vidwish\.live/i.test(embedUrl)) serverType = "vidcloud";

        streams.push({
          id: `anikoto-${srv.link_id}`,
          mal_id: malId,
          episode_number: episode,
          quality: "1080p",
          category: srv.language as "sub" | "dub",
          service_name: `anikoto-${serverType}`,
          service_url: embedUrl,
          embed_url: embedUrl,
          status: "active",
        });
      } catch {}
    }
    return streams;
  } catch {}
  return [];
}

export async function fetchExtEpisodes(malId: number): Promise<ExtEpisode[]> {
  // Try OKKUP (uses anime_id)
  try {
    const p = new URLSearchParams({
      select: "episode_number,title,title_english,aired,score,filler,recap,thumbnail,synopsis",
      anime_id: `eq.${malId}`,
      order: "episode_number.asc",
    });
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/episodes?${p}`, { headers });
    if (res.ok) {
      const d = await res.json();
      if (d?.length) {
        return d.map((e: any) => ({
          episode_number: e.episode_number,
          title: e.title,
          title_english: e.title_english || e.title,
          aired_string: e.aired,
          score: e.score,
          filler: e.filler,
          recap: e.recap,
          thumbnail: e.thumbnail,
        }));
      }
    }
  } catch {}
  // Fallback to FZR (uses anime_mal_id)
  const p = new URLSearchParams({
    select: "episode_number,title,title_english,aired_string,score,filler,recap,thumbnail",
    anime_mal_id: `eq.${malId}`,
    order: "episode_number.asc",
  });
  return apiFetch("episodes", p);
}
