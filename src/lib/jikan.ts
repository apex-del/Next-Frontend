const BASE_URL = "https://api.jikan.moe/v4";

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
  const res = await rateLimitedFetch(
    `${BASE_URL}/anime/${id}/recommendations`
  );
  return res.json();
}

export async function getGenres(): Promise<
  JikanResponse<Array<{ mal_id: number; name: string; count: number }>>
> {
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
