import { useQuery } from "@tanstack/react-query";
import { fetchStreams, fetchDownloads, fetchShortLinks } from "@/lib/externalDb";

export function useEpisodeStreams(malId: number, episode: number) {
  return useQuery({
    queryKey: ["ext-streams", malId, episode],
    queryFn: () => fetchStreams(malId, episode),
    enabled: !!malId && !!episode,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEpisodeDownloads(malId: number, episode: number) {
  return useQuery({
    queryKey: ["ext-downloads", malId, episode],
    queryFn: () => fetchDownloads(malId, episode),
    enabled: !!malId && !!episode,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEpisodeShortLinks(malId: number, episode: number) {
  return useQuery({
    queryKey: ["ext-shortlinks", malId, episode],
    queryFn: () => fetchShortLinks(malId, episode),
    enabled: !!malId && !!episode,
    staleTime: 5 * 60 * 1000,
  });
}
