import { useQuery } from "@tanstack/react-query";
import * as anilist from "@/lib/anilist";
import * as jikan from "@/lib/jikan";
import { getEpisodesTrio, fetchAllEpisodes } from "@/lib/animeData";

export function useTopAnime(
  filter: "airing" | "upcoming" | "bypopularity" | "favorite" | "" = "",
  page = 1
) {
  return useQuery({
    queryKey: ["top-anime", filter, page],
    queryFn: async () => {
      try {
        return await anilist.getTopAnime(page, filter);
      } catch {
        return jikan.getTopAnime(page, filter);
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useSeasonNow(page = 1) {
  return useQuery({
    queryKey: ["season-now", page],
    queryFn: async () => {
      try {
        return await anilist.getSeasonNow(page);
      } catch {
        return jikan.getSeasonNow(page);
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useSearchAnime(
  query: string,
  page = 1,
  genres?: string,
  status?: string,
  orderBy?: string,
  sort?: string,
  type?: string
) {
  return useQuery({
    queryKey: ["search-anime", query, page, genres, status, orderBy, sort, type],
    queryFn: async () => {
      try {
        return await anilist.searchAnime(query, page, genres, status, orderBy, sort, type);
      } catch {
        return jikan.searchAnime(query, page, genres, status, orderBy, sort, type);
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: true,
    retry: 2,
  });
}

export function useAnimeById(id: number) {
  return useQuery({
    queryKey: ["anime", id],
    queryFn: async () => {
      try {
        return await anilist.getAnimeById(id);
      } catch {
        return jikan.getAnimeById(id);
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
    retry: 2,
  });
}

export function useAnimeEpisodes(id: number, page = 1) {
  return useQuery({
    queryKey: ["anime-episodes-trio", id, page],
    queryFn: () => getEpisodesTrio(id, page),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
    retry: 2,
  });
}

export function useAllAnimeEpisodes(id: number, totalEps: number) {
  return useQuery({
    queryKey: ["anime-all-episodes", id, totalEps],
    queryFn: () => fetchAllEpisodes(id, totalEps),
    staleTime: 30 * 60 * 1000,
    enabled: !!id && totalEps > 0,
    retry: 1,
  });
}

export function useAnimeRecommendations(id: number) {
  return useQuery({
    queryKey: ["anime-recommendations", id],
    queryFn: async () => {
      try {
        return await anilist.getAnimeRecommendations(id);
      } catch {
        return jikan.getAnimeRecommendations(id);
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
    retry: 2,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      try {
        return await anilist.getGenres();
      } catch {
        return jikan.getGenres();
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 2,
  });
}
