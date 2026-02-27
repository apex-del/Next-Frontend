import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (anime: JikanAnime) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("favorites" as any).insert({
        user_id: user.id,
        anime_id: anime.mal_id,
        anime_title: getDisplayTitle(anime),
        anime_image: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
        anime_score: anime.score,
        anime_type: anime.type,
        anime_year: anime.year,
      } as any);
      if (error) throw error;
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
      const { error } = await supabase
        .from("favorites" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("anime_id", animeId);
      if (error) throw error;
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
