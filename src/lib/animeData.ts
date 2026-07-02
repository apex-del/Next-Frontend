import {
  getAnimeRecommendations as jikanRecs,
  getAnimeEpisodes as jikanEpisodes,
  type JikanEpisode,
  type JikanAnime,
} from "./jikan";
import { fetchExtEpisodes, fetchStreams } from "./externalDb";
import { getAniListMedia } from "./anilist";

const OKKUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://okkupxjkocgasztfldak.supabase.co";
const OKKUP_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export interface EpisodesResult {
  data: JikanEpisode[];
  pagination?: { last_visible_page: number; has_next_page: boolean; current_page: number };
  source: "jikan" | "external" | "anilist" | "none";
}

const PAGE = 100;

export async function getEpisodesTrio(id: number, page = 1): Promise<EpisodesResult> {
  // Source 1: DB (OKKUP → FZR)
  try {
    const ext = await fetchExtEpisodes(id);
    if (ext.length) {
      const mapped: JikanEpisode[] = ext.map((e) => ({
        mal_id: e.episode_number,
        title: e.title_english || e.title || `Episode ${e.episode_number}`,
        title_japanese: null,
        title_romanji: null,
        aired: e.aired_string,
        score: e.score,
        filler: e.filler,
        recap: e.recap,
        forum_url: null,
        thumbnail: e.thumbnail,
      }));
      const start = (page - 1) * PAGE;
      const slice = mapped.slice(start, start + PAGE);
      const last = Math.max(1, Math.ceil(mapped.length / PAGE));
      const enriched = await enrichSubDub(id, slice);
      return {
        data: enriched,
        pagination: { last_visible_page: last, has_next_page: page < last, current_page: page },
        source: "external",
      };
    }
  } catch {}

  // Source 2: AniList — only use if it has a known total episode count
  try {
    const media = await getAniListMedia(id);
    if (media?.episodes && media.episodes > 0) {
      const mapped: JikanEpisode[] = Array.from({ length: media.episodes }, (_, i) => ({
        mal_id: i + 1,
        title: `Episode ${i + 1}`,
        title_japanese: null,
        title_romanji: null,
        aired: null,
        score: null,
        filler: false,
        recap: false,
        forum_url: null,
        thumbnail: null,
      }));
      // Enrich with streaming episode titles/thumbnails if available
      if (media.streamingEpisodes?.length) {
        for (const se of media.streamingEpisodes) {
          const title = se.title || "";
          const match = title.match(/Episode\s+(\d+)/i);
          if (match) {
            const epNum = parseInt(match[1]);
            if (epNum >= 1 && epNum <= mapped.length) {
              mapped[epNum - 1].title = title.replace(/^Episode\s+\d+\s*[-–]\s*/i, "") || title;
              mapped[epNum - 1].thumbnail = se.thumbnail;
            }
          }
        }
      }
      if (mapped.length) {
        const start = (page - 1) * PAGE;
        const slice = mapped.slice(start, start + PAGE);
        const last = Math.max(1, Math.ceil(mapped.length / PAGE));
        const enriched = await enrichSubDub(id, slice);
        return {
          data: enriched,
          pagination: { last_visible_page: last, has_next_page: page < last, current_page: page },
          source: "anilist",
        };
      }
    }
  } catch {}

  // Source 3: Jikan API — full episode list with pagination (100 eps/page)
  try {
    const jkRes = await jikanEpisodes(id, page);
    if (jkRes?.data?.length) {
      const enriched = await enrichSubDub(id, jkRes.data);
      return {
        data: enriched,
        pagination: jkRes.pagination,
        source: "jikan",
      };
    }
  } catch {}

  return { data: [], source: "none" };
}

export async function fetchAllEpisodes(id: number, totalEps: number): Promise<JikanEpisode[]> {
  if (totalEps <= 0) return [];
  const all: JikanEpisode[] = [];
  const totalPages = Math.ceil(totalEps / PAGE);
  for (let p = 1; p <= totalPages; p++) {
    try {
      const result = await getEpisodesTrio(id, p);
      if (result.data.length) all.push(...result.data);
      if (result.data.length < PAGE) break;
    } catch {}
  }
  return all;
}

async function enrichSubDub(id: number, episodes: JikanEpisode[]): Promise<JikanEpisode[]> {
  try {
    const streams = await fetchStreams(id);
    const byEp = new Map<number, { sub: boolean; dub: boolean }>();
    for (const s of streams) {
      if (!byEp.has(s.episode_number)) byEp.set(s.episode_number, { sub: false, dub: false });
      const entry = byEp.get(s.episode_number)!;
      if (s.category === "dub") entry.dub = true;
      else entry.sub = true;
    }
    return episodes.map((ep) => {
      const info = byEp.get(ep.mal_id);
      if (info) {
        return { ...ep, hasSub: info.sub, hasDub: info.dub };
      }
      return ep;
    });
  } catch {
    return episodes;
  }
}

export interface RecEntry {
  entry: Pick<JikanAnime, "mal_id" | "title"> & {
    images: { jpg: { image_url: string; large_image_url: string }; webp: { image_url: string; large_image_url: string } };
    score?: number | null;
  };
}

function anilistImg(url: string | null): JikanAnime["images"] {
  const u = url || "";
  return {
    jpg: { image_url: u, small_image_url: u, large_image_url: u },
    webp: { image_url: u, small_image_url: u, large_image_url: u },
  };
}

export async function getRecommendationsTrio(id: number): Promise<RecEntry[]> {
  // Try OKKUP first
  try {
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/recommendations?anime_id=eq.${id}&select=recommended_mal_id,recommended_title,recommended_image,votes&order=votes.desc&limit=12`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) {
        return rows.map((r: any) => ({
          entry: {
            mal_id: r.recommended_mal_id,
            title: r.recommended_title,
            images: {
              jpg: { image_url: r.recommended_image || "", small_image_url: "", large_image_url: r.recommended_image || "" },
              webp: { image_url: "", small_image_url: "", large_image_url: "" },
            },
            score: null,
          },
        }));
      }
    }
  } catch {}
  try {
    const jk = await jikanRecs(id);
    if (jk?.data?.length) return jk.data as unknown as RecEntry[];
  } catch {}
  try {
    const media = await getAniListMedia(id);
    const recs = (media?.recommendations?.nodes || [])
      .map((n) => n.mediaRecommendation)
      .filter((m): m is NonNullable<typeof m> => !!m && !!m.idMal);
    if (recs.length) {
      return recs.map((m) => ({
        entry: {
          mal_id: m.idMal as number,
          title: m.title.english || m.title.romaji || "Unknown",
          images: anilistImg(m.coverImage.large),
          score: m.averageScore ? m.averageScore / 10 : null,
        },
      }));
    }
  } catch {}
  return [];
}

export interface RelationGroup {
  relation: string;
  entries: Array<{ mal_id: number; title: string; image: string | null; type: string; format: string | null }>;
}

export async function getRelationsTrio(id: number): Promise<RelationGroup[]> {
  const EXCLUDED = new Set(["character", "other"]);
  try {
    const media = await getAniListMedia(id);
    const edges = (media?.relations?.edges || []).filter(
      (e) =>
        e.node.type === "ANIME" &&
        e.node.idMal &&
        !EXCLUDED.has((e.relationType || "").replace(/_/g, " ").toLowerCase())
    );
    if (edges.length) {
      const groups = new Map<string, RelationGroup>();
      edges.forEach((e) => {
        const rel = e.relationType
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const g = groups.get(rel) || { relation: rel, entries: [] };
        g.entries.push({
          mal_id: e.node.idMal as number,
          title: e.node.title.english || e.node.title.romaji || "Unknown",
          image: e.node.coverImage.large,
          type: e.node.type,
          format: e.node.format,
        });
        groups.set(rel, g);
      });
      return Array.from(groups.values());
    }
  } catch {}

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/relations`);
    if (res.ok) {
      const json = (await res.json()) as {
        data?: Array<{ relation: string; entry: Array<{ mal_id: number; type: string; name: string }> }>;
      };
      const groups: RelationGroup[] = [];
      (json.data || []).forEach((rg) => {
        if (EXCLUDED.has((rg.relation || "").toLowerCase())) return;
        const entries = rg.entry
          .filter((e) => e.type === "anime")
          .map((e) => ({
            mal_id: e.mal_id,
            title: e.name,
            image: null,
            type: "ANIME",
            format: null,
          }));
        if (entries.length) groups.push({ relation: rg.relation, entries });
      });
      if (groups.length) return groups;
    }
  } catch {}

  return [];
}
