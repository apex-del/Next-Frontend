const BASE_URL = "https://api.jikan.moe/v4";
const OKKUP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://okkupxjkocgasztfldak.supabase.co";
const OKKUP_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const FZR_URL = process.env.NEXT_PUBLIC_EXT_SUPABASE_URL || "https://fzrpquslqktavfqbmccu.supabase.co";
const FZR_KEY = process.env.NEXT_PUBLIC_EXT_SUPABASE_KEY || "sb_publishable_1Mj9H6h54_sJqKdTCHjLkQ_bxid-IGr";

async function fetchAnimeFromDb(malId: number): Promise<JikanAnime | null> {
  // Try OKKUP first
  try {
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/anime?mal_id=eq.${malId}&limit=1`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) return mapDbRowToJikan(rows[0]);
    }
  } catch {}
  // Fallback FZR
  try {
    const headers = { apikey: FZR_KEY, Authorization: `Bearer ${FZR_KEY}` };
    const res = await fetch(`${FZR_URL}/rest/v1/anime?mal_id=eq.${malId}&limit=1`, { headers });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows?.length) return null;
    return mapDbRowToJikan(rows[0]);
  } catch { return null; }
}

function mapDbRowToJikan(r: any): JikanAnime {
  return {
    mal_id: r.mal_id,
    title: r.title || r.title_english || "",
    title_english: r.title_english || null,
    title_japanese: r.title_japanese || null,
    synopsis: r.synopsis || r.description || null,
    score: r.score || (r.average_score ? r.average_score / 10 : null),
    scored_by: r.scored_by || null,
    rank: r.rank || null,
    popularity: r.popularity || null,
    members: r.members || null,
    episodes: r.episodes || 0,
    status: r.status || "",
    rating: r.rating || r.age_rating || null,
    year: r.start_date_year || r.aired_from_year || null,
    season: r.season || null,
    type: r.type || r.format || "",
    source: r.source || "",
    duration: typeof r.duration === "number" ? `${r.duration} min` : r.duration || "",
    aired: {
      from: r.aired_from || null,
      to: r.aired_to || null,
      string: r.aired_string || "",
    },
    studios: [],
    genres: [],
    themes: [],
    images: {
      jpg: {
        image_url: r.image_url || "",
        small_image_url: r.image_small || r.image_url || "",
        large_image_url: r.image_large || r.image_url || "",
      },
      webp: {
        image_url: r.image_webp || r.image_url || "",
        small_image_url: r.image_webp_small || r.image_webp || r.image_url || "",
        large_image_url: r.image_webp_large || r.image_webp || r.image_url || "",
      },
    },
    trailer: {
      youtube_id: r.trailer_youtube_id || null,
      url: r.trailer_url || null,
      images: {
        image_url: r.trailer_image_url || null,
        small_image_url: null,
        medium_image_url: null,
        large_image_url: r.trailer_image_url || null,
        maximum_image_url: null,
      },
    },
  };
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  synopsis: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  episodes: number | null;
  status: string;
  rating: string | null;
  year: number | null;
  season: string | null;
  type: string;
  source: string;
  duration: string;
  aired: {
    from: string | null;
    to: string | null;
    string: string;
  };
  studios: Array<{ mal_id: number; name: string }>;
  genres: Array<{ mal_id: number; name: string }>;
  themes: Array<{ mal_id: number; name: string }>;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    images: {
      image_url: string | null;
      small_image_url: string | null;
      medium_image_url: string | null;
      large_image_url: string | null;
      maximum_image_url: string | null;
    };
  };
}

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  score: number | null;
  filler: boolean;
  recap: boolean;
  forum_url: string | null;
}

interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

let lastRequest = 0;
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const diff = now - lastRequest;
  if (diff < 350) {
    await new Promise((r) => setTimeout(r, 350 - diff));
  }
  lastRequest = Date.now();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Jikan API error: ${res.status}`);
  }
  return res;
}

export async function getTopAnime(
  page = 1,
  filter: "airing" | "upcoming" | "bypopularity" | "favorite" | "" = ""
): Promise<JikanResponse<JikanAnime[]>> {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (filter) params.set("filter", filter);
  const res = await rateLimitedFetch(`${BASE_URL}/top/anime?${params}`);
  return res.json();
}

export async function getSeasonNow(
  page = 1
): Promise<JikanResponse<JikanAnime[]>> {
  const res = await rateLimitedFetch(
    `${BASE_URL}/seasons/now?page=${page}&limit=20`
  );
  return res.json();
}

export async function searchAnime(
  query: string,
  page = 1,
  genres?: string,
  status?: string,
  orderBy?: string,
  sort?: string,
  type?: string
): Promise<JikanResponse<JikanAnime[]>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "24",
    sfw: "true",
  });
  if (query) params.set("q", query);
  if (genres) params.set("genres", genres);
  if (status) params.set("status", status);
  if (orderBy) params.set("order_by", orderBy);
  if (sort) params.set("sort", sort);
  if (type) params.set("type", type);
  const res = await rateLimitedFetch(`${BASE_URL}/anime?${params}`);
  return res.json();
}

export async function getAnimeById(
  id: number
): Promise<JikanResponse<JikanAnime>> {
  const cached = await fetchAnimeFromDb(id);
  if (cached) return { data: cached };
  const res = await rateLimitedFetch(`${BASE_URL}/anime/${id}/full`);
  return res.json();
}

export async function getAnimeEpisodes(
  id: number,
  page = 1
): Promise<JikanResponse<JikanEpisode[]>> {
  const res = await rateLimitedFetch(
    `${BASE_URL}/anime/${id}/episodes?page=${page}`
  );
  return res.json();
}

export async function getAnimeRecommendations(
  id: number
): Promise<JikanResponse<Array<{ entry: JikanAnime }>>> {
  // Try OKKUP first
  try {
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/recommendations?anime_id=eq.${id}&select=recommended_mal_id,recommended_title,recommended_image,votes&order=votes.desc&limit=12`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) {
        return {
          data: rows.map((r: any) => ({
            entry: {
              mal_id: r.recommended_mal_id,
              title: r.recommended_title,
              title_english: null,
              title_japanese: null,
              synopsis: null,
              score: null,
              scored_by: null,
              rank: null,
              popularity: null,
              members: null,
              episodes: 0,
              status: "",
              rating: null,
              year: null,
              season: null,
              type: "",
              source: "",
              duration: "",
              aired: { from: null, to: null, string: "" },
              studios: [],
              genres: [],
              themes: [],
              images: {
                jpg: { image_url: r.recommended_image || "", small_image_url: "", large_image_url: r.recommended_image || "" },
                webp: { image_url: "", small_image_url: "", large_image_url: "" },
              },
              trailer: { youtube_id: null, url: null, images: { image_url: null, small_image_url: null, medium_image_url: null, large_image_url: null, maximum_image_url: null } },
            },
          })),
        };
      }
    }
  } catch {}
  // Fallback FZR
  try {
    const headers = { apikey: FZR_KEY, Authorization: `Bearer ${FZR_KEY}` };
    const res = await fetch(`${FZR_URL}/rest/v1/anime_recommendations?anime_mal_id=eq.${id}&select=recommended_mal_id,recommended_title,recommended_image_url,vote_count&limit=20`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) {
        return {
          data: rows.map((r: any) => ({
            entry: {
              mal_id: r.recommended_mal_id,
              title: r.recommended_title,
              title_english: null,
              title_japanese: null,
              synopsis: null,
              score: null,
              scored_by: null,
              rank: null,
              popularity: null,
              members: null,
              episodes: 0,
              status: "",
              rating: null,
              year: null,
              season: null,
              type: "",
              source: "",
              duration: "",
              aired: { from: null, to: null, string: "" },
              studios: [],
              genres: [],
              themes: [],
              images: {
                jpg: { image_url: r.recommended_image_url || "", small_image_url: "", large_image_url: r.recommended_image_url || "" },
                webp: { image_url: "", small_image_url: "", large_image_url: "" },
              },
              trailer: { youtube_id: null, url: null, images: { image_url: null, small_image_url: null, medium_image_url: null, large_image_url: null, maximum_image_url: null } },
            },
          })),
        };
      }
    }
  } catch {}
  const res = await rateLimitedFetch(`${BASE_URL}/anime/${id}/recommendations`);
  return res.json();
}

export async function getGenres(): Promise<
  JikanResponse<Array<{ mal_id: number; name: string; count: number }>>
> {
  // Try OKKUP first
  try {
    const headers = { apikey: OKKUP_KEY, Authorization: `Bearer ${OKKUP_KEY}` };
    const res = await fetch(`${OKKUP_URL}/rest/v1/genres?select=mal_id,name&limit=100`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) return { data: rows.map((g: any) => ({ mal_id: g.mal_id, name: g.name, count: 0 })) };
    }
  } catch {}
  // Fallback FZR
  try {
    const headers = { apikey: FZR_KEY, Authorization: `Bearer ${FZR_KEY}` };
    const res = await fetch(`${FZR_URL}/rest/v1/genres?select=mal_id,name,count&limit=100`, { headers });
    if (res.ok) {
      const rows = await res.json();
      if (rows?.length) return { data: rows.map((g: any) => ({ mal_id: g.mal_id, name: g.name, count: g.count || 0 })) };
    }
  } catch {}
  const res = await rateLimitedFetch(`${BASE_URL}/genres/anime`);
  return res.json();
}

export function getDisplayTitle(anime: JikanAnime): string {
  return anime.title_english || anime.title;
}

export function getBannerImage(anime: JikanAnime): string {
  return (
    anime.trailer?.images?.maximum_image_url ||
    anime.trailer?.images?.large_image_url ||
    anime.images.jpg.large_image_url
  );
}

export function getStatusColor(status: string): string {
  if (status === "Currently Airing") return "text-green-400";
  if (status === "Finished Airing") return "text-blue-400";
  return "text-yellow-400";
}
