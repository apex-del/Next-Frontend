import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useWatchHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["watch-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watch_history" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const addToHistory = useMutation({
    mutationFn: async (entry: {
      anime_id: number;
      anime_title: string;
      anime_image?: string;
      episode_number?: number;
      episode_title?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("watch_history" as any).upsert(
        {
          user_id: user.id,
          ...entry,
          watched_at: new Date().toISOString(),
        } as any,
        { onConflict: "user_id,anime_id,episode_number" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("watch_history" as any)
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
    },
  });

  const removeFromHistory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("watch_history" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
    },
  });

  return {
    history: query.data || [],
    isLoading: query.isLoading,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
