const ANILIST = "https://graphql.anilist.co";

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(ANILIST, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T;
  } catch {
    return null;
  }
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

export async function getAniListMedia(malId: number): Promise<AniListMedia | null> {
  const data = await gql<{ Media: AniListMedia }>(MEDIA_QUERY, { idMal: malId });
  return data?.Media ?? null;
}
