const ANILIST_API = "https://graphql.anilist.co";

const CACHE_PREFIX = "ani_cache_";
const CACHE_TTL = 10 * 60 * 1000;

function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, expiry } = JSON.parse(cached);
      if (Date.now() < expiry) return Promise.resolve(data);
    }
  } catch {}
  return fetcher().then((data) => {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiry: Date.now() + CACHE_TTL }));
    } catch {}
    return data;
  });
}

const LIST_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $season: Season, $seasonYear: Int, $search: String, $genre: String, $status: MediaStatus, $format: MediaFormat) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, season: $season, seasonYear: $seasonYear, search: $search, genre: $genre, status: $status, format: $format, isAdult: false) {
      id idMal
      title { romaji english native }
      description
      averageScore meanScore popularity
      rankings { rank type }
      episodes status season seasonYear format source duration
      startDate { year month day }
      genres studios { nodes { name } }
      coverImage { extraLarge large medium }
      bannerImage trailer { id site }
    }
  }
}`;

const DETAIL_QUERY = `
query ($idMal: Int) {
  Media(idMal: $idMal, type: ANIME) {
    id idMal
    title { romaji english native }
    description averageScore meanScore popularity
    rankings { rank type }
    episodes status season seasonYear format source duration
    startDate { year month day }
    genres studios { nodes { name } }
    coverImage { extraLarge large medium }
    bannerImage trailer { id site }
  }
}`;

const RECS_QUERY = `
query ($idMal: Int) {
  Media(idMal: $idMal) {
    recommendations(page: 1, perPage: 12, sort: RATING_DESC) {
      nodes {
        mediaRecommendation {
          id idMal
          title { romaji english }
          coverImage { extraLarge large medium }
          averageScore format episodes
        }
      }
    }
  }
}`;

const GENRES_QUERY = `{ GenreCollection }`;

interface AniMedia {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null; native: string | null };
  description: string | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  rankings: Array<{ rank: number; type: string }>;
  episodes: number | null;
  status: string;
  season: string | null;
  seasonYear: number | null;
  format: string;
  source: string;
  duration: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  genres: string[];
  studios: { nodes: Array<{ name: string }> };
  coverImage: { extraLarge: string; large: string; medium: string };
  bannerImage: string | null;
  trailer: { id: string; site: string } | null;
}

export interface AniListRelation {
  relationType: string;
  node: {
    idMal: number | null;
    type: string;
    format: string | null;
    title: { romaji: string | null; english: string | null };
    coverImage: { large: string | null };
  };
}

export interface AniListRec {
  idMal: number | null;
  title: { romaji: string | null; english: string | null };
  coverImage: { large: string | null };
  averageScore: number | null;
  format: string | null;
}

export interface AniListStreamEp {
  title: string | null;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
}

export interface AniListMedia {
  id: number;
  episodes: number | null;
  trailer: { id: string | null; site: string | null } | null;
  relations: { edges: AniListRelation[] };
  recommendations: { nodes: Array<{ mediaRecommendation: AniListRec | null }> };
  streamingEpisodes: AniListStreamEp[];
}

const MEDIA_QUERY = `
query($idMal:Int){
  Media(idMal:$idMal,type:ANIME){
    id episodes
    trailer{ id site }
    relations{ edges{ relationType node{ idMal type format title{ romaji english } coverImage{ large } } } }
    recommendations{ nodes{ mediaRecommendation{ idMal title{ romaji english } coverImage{ large } averageScore format } } }
    streamingEpisodes{ title thumbnail url site }
  }
}`;

function mapToJikan(media: AniMedia) {
  const rank = media.rankings?.find((r) => r.type === "RANKED")?.rank || null;
  const studio = media.studios?.nodes?.[0]?.name || null;
  const year = media.seasonYear || media.startDate?.year || null;
  const genreObjs = (media.genres || []).map((name: string, i: number) => ({ mal_id: i + 1, name }));
  const status = media.status === "RELEASING" ? "Currently Airing" : media.status === "FINISHED" ? "Finished Airing" : media.status === "NOT_YET_RELEASED" ? "Not yet aired" : media.status || "";
  const type = media.format === "TV" ? "TV" : media.format === "MOVIE" ? "Movie" : media.format === "OVA" ? "OVA" : media.format === "ONA" ? "ONA" : media.format === "SPECIAL" ? "Special" : media.format === "MUSIC" ? "Music" : media.format || "";

  return {
    mal_id: media.idMal || media.id,
    title: media.title.romaji || media.title.english || "",
    title_english: media.title.english || null,
    title_japanese: media.title.native || null,
    synopsis: media.description ? media.description.replace(/<[^>]*>/g, "").slice(0, 1000) : null,
    score: media.averageScore ? media.averageScore / 10 : null,
    scored_by: null,
    rank,
    popularity: media.popularity || null,
    members: null,
    episodes: media.episodes || 0,
    status,
    rating: null,
    year,
    season: media.season ? media.season.toLowerCase() : null,
    type,
    source: media.source || "",
    duration: media.duration ? `${media.duration} min` : "",
    aired: {
      from: media.startDate?.year ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, "0")}-${String(media.startDate.day || 1).padStart(2, "0")}` : null,
      to: null,
      string: media.seasonYear ? `${media.season || ""} ${media.seasonYear}`.trim() : "",
    },
    studios: studio ? [{ mal_id: 1, name: studio }] : [],
    genres: genreObjs,
    themes: [],
    images: {
      jpg: {
        image_url: media.coverImage?.medium || "",
        small_image_url: media.coverImage?.medium || "",
        large_image_url: media.coverImage?.large || media.coverImage?.extraLarge || "",
      },
      webp: {
        image_url: media.coverImage?.medium || "",
        small_image_url: media.coverImage?.medium || "",
        large_image_url: media.coverImage?.large || media.coverImage?.extraLarge || "",
      },
    },
    trailer: media.trailer?.site === "youtube" && media.trailer?.id
      ? {
          youtube_id: media.trailer.id,
          url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
          images: {
            image_url: `https://img.youtube.com/vi/${media.trailer.id}/hqdefault.jpg`,
            small_image_url: `https://img.youtube.com/vi/${media.trailer.id}/default.jpg`,
            medium_image_url: `https://img.youtube.com/vi/${media.trailer.id}/mqdefault.jpg`,
            large_image_url: `https://img.youtube.com/vi/${media.trailer.id}/hqdefault.jpg`,
            maximum_image_url: `https://img.youtube.com/vi/${media.trailer.id}/maxresdefault.jpg`,
          },
        }
      : { youtube_id: null, url: null, images: { image_url: null, small_image_url: null, medium_image_url: null, large_image_url: null, maximum_image_url: null } },
  };
}

function aniSort(s: string): string[] {
  if (s === "bypopularity") return ["POPULARITY_DESC"];
  if (s === "favorite") return ["TRENDING_DESC"];
  if (s === "airing") return ["TRENDING_DESC"];
  if (s === "upcoming") return ["POPULARITY_DESC"];
  return ["SCORE_DESC"];
}

function aniStatus(s: string): string | null {
  if (s === "airing") return "RELEASING";
  if (s === "complete") return "FINISHED";
  if (s === "upcoming") return "NOT_YET_RELEASED";
  return null;
}

function aniFormat(s: string): string | null {
  const map: Record<string, string> = { tv: "TV", movie: "MOVIE", ova: "OVA", ona: "ONA", special: "SPECIAL", music: "MUSIC" };
  return map[s] || null;
}

async function aniFetch<T>(query: string, vars: Record<string, any>): Promise<T> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: vars }),
  });
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
  return json.data;
}

export async function getTopAnime(page = 1, filter = ""): Promise<{ data: any[]; pagination?: any }> {
  const cacheKey = `ani-top-${page}-${filter}`;
  return cachedFetch(cacheKey, async () => {
    const sort = aniSort(filter);
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(LIST_QUERY, { page, perPage: 20, sort });
    return { data: (data.Page?.media || []).map(mapToJikan) };
  });
}

export async function getSeasonNow(page = 1): Promise<{ data: any[]; pagination?: any }> {
  const cacheKey = `ani-season-${page}`;
  return cachedFetch(cacheKey, async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const season = month <= 3 ? "SPRING" : month <= 6 ? "SUMMER" : month <= 9 ? "FALL" : "WINTER";
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(LIST_QUERY, {
      page, perPage: 20, sort: ["POPULARITY_DESC"], season, seasonYear: year,
    });
    return { data: (data.Page?.media || []).map(mapToJikan) };
  });
}

export async function searchAnime(
  query: string, page = 1, genre?: string, status?: string,
  orderBy?: string, _sort?: string, type?: string
): Promise<{ data: any[]; pagination?: any }> {
  const cacheKey = `ani-search-${query}-${page}-${genre}-${status}-${orderBy}-${type}`;
  return cachedFetch(cacheKey, async () => {
    const sort = orderBy === "score" ? ["SCORE_DESC"] : orderBy === "popularity" ? ["POPULARITY_DESC"] : orderBy === "start_date" ? ["START_DATE_DESC"] : undefined;
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(LIST_QUERY, {
      page, perPage: 24, search: query || undefined,
      genre: genre || undefined,
      status: aniStatus(status || "") || undefined,
      sort,
      format: aniFormat(type || "") || undefined,
    });
    return { data: (data.Page?.media || []).map(mapToJikan) };
  });
}

export async function getAnimeById(id: number): Promise<{ data: any }> {
  const cacheKey = `ani-byid-${id}`;
  return cachedFetch(cacheKey, async () => {
    const data = await aniFetch<{ Media: AniMedia }>(DETAIL_QUERY, { idMal: id });
    return { data: mapToJikan(data.Media) };
  });
}

export async function getAnimeRecommendations(id: number): Promise<{ data: Array<{ entry: any }> }> {
  const cacheKey = `ani-recs-${id}`;
  return cachedFetch(cacheKey, async () => {
    const data = await aniFetch<{ Media: { recommendations: { nodes: Array<{ mediaRecommendation: AniMedia | null }> } } }>(RECS_QUERY, { idMal: id });
    const nodes = data.Media?.recommendations?.nodes || [];
    return {
      data: nodes.filter((n) => n.mediaRecommendation).map((n) => ({ entry: mapToJikan(n.mediaRecommendation!) })),
    };
  });
}

export async function getGenres(): Promise<{ data: Array<{ mal_id: number; name: string; count: number }> }> {
  const cacheKey = "ani-genres";
  return cachedFetch(cacheKey, async () => {
    const data = await aniFetch<{ GenreCollection: string[] }>(GENRES_QUERY, {});
    return { data: (data.GenreCollection || []).map((name: string, i: number) => ({ mal_id: i + 1, name, count: 0 })) };
  });
}

export async function getAnimeEpisodes(_id: number, _page = 1): Promise<{ data: any[] }> {
  return { data: [] };
}

export async function getAniListMedia(malId: number): Promise<AniListMedia | null> {
  const data = await aniFetch<{ Media: AniListMedia }>(MEDIA_QUERY, { idMal: malId });
  return data?.Media ?? null;
}
