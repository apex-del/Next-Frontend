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

const MEDIA_FIELDS = `
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
`;

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

async function aniFetch<T>(query: string, vars: Record<string, any>): Promise<T> {
  for (const k of Object.keys(vars)) { if (vars[k] === undefined) delete vars[k]; }
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: vars }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`AniList API error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList error");
  return json.data;
}

export async function getTopAnime(page = 1, filter = ""): Promise<{ data: any[]; pagination?: any }> {
  const cacheKey = `ani-top-${page}-${filter}`;
  return cachedFetch(cacheKey, async () => {
    const sort = filter === "bypopularity" ? ["POPULARITY_DESC"] : filter === "favorite" ? ["TRENDING_DESC"] : filter === "airing" ? ["TRENDING_DESC", "SCORE_DESC"] : filter === "upcoming" ? ["POPULARITY_DESC", "SCORE_DESC"] : ["SCORE_DESC"];
    const status = filter === "airing" ? "RELEASING" : filter === "upcoming" ? "NOT_YET_RELEASED" : undefined;
    const q = `query($p:Int,$s:[MediaSort],$st:MediaStatus){Page(page:$p,perPage:20){media(type:ANIME,sort:$s,status:$st,isAdult:false){${MEDIA_FIELDS}}}}`;
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(q, { p: page, s: sort, st: status });
    return { data: (data.Page?.media || []).map(mapToJikan) };
  });
}

export async function getSeasonNow(page = 1): Promise<{ data: any[]; pagination?: any }> {
  const cacheKey = `ani-season-${page}`;
  return cachedFetch(cacheKey, async () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const sea = m <= 3 ? "SPRING" : m <= 6 ? "SUMMER" : m <= 9 ? "FALL" : "WINTER";
    const q = `query($p:Int,$sea:Season,$y:Int){Page(page:$p,perPage:20){media(type:ANIME,season:$sea,seasonYear:$y,sort:POPULARITY_DESC,isAdult:false){${MEDIA_FIELDS}}}}`;
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(q, { p: page, sea, y });
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
    const st = status === "airing" ? "RELEASING" : status === "complete" ? "FINISHED" : status === "upcoming" ? "NOT_YET_RELEASED" : undefined;
    const fmt = type === "tv" ? "TV" : type === "movie" ? "MOVIE" : type === "ova" ? "OVA" : type === "ona" ? "ONA" : type === "special" ? "SPECIAL" : type === "music" ? "MUSIC" : undefined;
    const q = `query($p:Int,$q:String,$g:String,$st:MediaStatus,$s:[MediaSort],$f:MediaFormat){Page(page:$p,perPage:24){media(type:ANIME,search:$q,genre:$g,status:$st,sort:$s,format:$f,isAdult:false){${MEDIA_FIELDS}}}}`;
    const data = await aniFetch<{ Page: { media: AniMedia[] } }>(q, { p: page, q: query || undefined, g: genre || undefined, st, s: sort, f: fmt });
    return { data: (data.Page?.media || []).map(mapToJikan) };
  });
}

export async function getAnimeById(id: number): Promise<{ data: any }> {
  const cacheKey = `ani-byid-${id}`;
  return cachedFetch(cacheKey, async () => {
    const q = `query($id:Int){Media(idMal:$id,type:ANIME){${MEDIA_FIELDS}}}`;
    const data = await aniFetch<{ Media: AniMedia }>(q, { id });
    return { data: mapToJikan(data.Media) };
  });
}

export async function getAnimeRecommendations(id: number): Promise<{ data: Array<{ entry: any }> }> {
  const cacheKey = `ani-recs-${id}`;
  return cachedFetch(cacheKey, async () => {
    const q = `query($id:Int){Media(idMal:$id){recommendations(page:1,perPage:12,sort:RATING_DESC){nodes{mediaRecommendation{id idMal title{romaji english}coverImage{extraLarge large medium}averageScore format episodes}}}}}`;
    const data = await aniFetch<{ Media: { recommendations: { nodes: Array<{ mediaRecommendation: AniMedia | null }> } } }>(q, { id });
    const nodes = data.Media?.recommendations?.nodes || [];
    return { data: nodes.filter((n) => n.mediaRecommendation).map((n) => ({ entry: mapToJikan(n.mediaRecommendation!) })) };
  });
}

export async function getGenres(): Promise<{ data: Array<{ mal_id: number; name: string; count: number }> }> {
  const cacheKey = "ani-genres";
  return cachedFetch(cacheKey, async () => {
    const data = await aniFetch<{ GenreCollection: string[] }>("{GenreCollection}", {});
    return { data: (data.GenreCollection || []).map((n: string, i: number) => ({ mal_id: i + 1, name: n, count: 0 })) };
  });
}

export async function getAnimeEpisodes(_id: number, _page = 1): Promise<{ data: any[] }> {
  return { data: [] };
}

export async function getAniListMedia(malId: number): Promise<AniListMedia | null> {
  const data = await aniFetch<{ Media: AniListMedia }>(MEDIA_QUERY, { idMal: malId });
  return data?.Media ?? null;
}
