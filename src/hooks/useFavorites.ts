import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";
import { useToast } from "@/hooks/use-toast";

const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "";

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${workerUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const data = await fetchWithAuth("/api/favorites");
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (anime: JikanAnime) => {
      if (!user) throw new Error("Must be logged in");
      await fetchWithAuth("/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          anime_id: anime.mal_id,
          anime_title: getDisplayTitle(anime),
          anime_image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
          anime_score: anime.score,
          anime_type: anime.type,
          anime_year: anime.year,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({ title: "Added to favorites ❤️" });
    },
    onError: (err: any) => {
      if (err.message?.includes("duplicate")) {
        toast({ title: "Already in favorites", variant: "destructive" });
      } else {
        toast({ title: "Failed to add favorite", variant: "destructive" });
      }
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (animeId: number) => {
      if (!user) throw new Error("Must be logged in");
      await fetchWithAuth("/api/favorites", {
        method: "DELETE",
        body: JSON.stringify({ anime_id: animeId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({ title: "Removed from favorites" });
    },
  });

  const isFavorite = (animeId: number) => {
    return query.data?.some((f: any) => f.anime_id === animeId) ?? false;
  };

  return {
    favorites: query.data || [],
    isLoading: query.isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
