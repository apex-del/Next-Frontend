import { useQuery } from "@tanstack/react-query";
import {
  getTopAnime,
  getSeasonNow,
  searchAnime,
  getAnimeById,
  getAnimeRecommendations,
  getGenres,
} from "@/lib/jikan";
import { getEpisodesTrio } from "@/lib/animeData";

export function useTopAnime(
  filter: "airing" | "upcoming" | "bypopularity" | "favorite" | "" = "",
  page = 1
) {
  return useQuery({
    queryKey: ["top-anime", filter, page],
    queryFn: () => getTopAnime(page, filter),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSeasonNow(page = 1) {
  return useQuery({
    queryKey: ["season-now", page],
    queryFn: () => getSeasonNow(page),
    staleTime: 5 * 60 * 1000,
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
    queryFn: () => searchAnime(query, page, genres, status, orderBy, sort, type),
    staleTime: 3 * 60 * 1000,
    enabled: true,
  });
}

export function useAnimeById(id: number) {
  return useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnimeById(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

export function useAnimeEpisodes(id: number, page = 1) {
  return useQuery({
    queryKey: ["anime-episodes-trio", id, page],
    queryFn: () => getEpisodesTrio(id, page),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

export function useAnimeRecommendations(id: number) {
  return useQuery({
    queryKey: ["anime-recommendations", id],
    queryFn: () => getAnimeRecommendations(id),
    staleTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: 60 * 60 * 1000,
  });
}
