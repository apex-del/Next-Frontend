import { useQuery } from "@tanstack/react-query";
import {
  fetchStreams,
  fetchDownloads,
  fetchShortLinks,
  fetchAnikotoEmbeds,
  StreamLink,
} from "@/lib/externalDb";

export function useEpisodeStreams(malId: number, episode: number) {
  return useQuery({
    queryKey: ["ext-streams", malId, episode],
    queryFn: async (): Promise<StreamLink[]> => {
      // 1. Try own pipeline streams first
      const own = await fetchStreams(malId, episode);
      if (own.length > 0) return own;

      // 2. Fallback: anikoto embeds
      const anikoto = await fetchAnikotoEmbeds(malId, episode);
      if (anikoto.length > 0) return anikoto;

      return [];
    },
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
