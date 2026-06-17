import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export type AnimeStatusValue = "watched" | "watching" | "planning" | "dropped";

export interface AnimeStatusRow {
  id: string;
  user_id: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  status: AnimeStatusValue;
  created_at: string;
  updated_at: string;
}

export function useAnimeStatus(animeId?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["anime-status", user?.id, animeId],
    queryFn: async () => {
      if (!user || !animeId) return null;
      const { data } = await supabase
        .from("anime_status" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("anime_id", animeId)
        .maybeSingle();
      return (data as any) as AnimeStatusRow | null;
    },
    enabled: !!user && !!animeId,
  });
}

export function useSetAnimeStatus() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      anime_id: number;
      anime_title: string;
      anime_image?: string | null;
      status: AnimeStatusValue | null;
    }) => {
      if (!user) throw new Error("Sign in required");
      if (payload.status === null) {
        const { error } = await supabase
          .from("anime_status" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("anime_id", payload.anime_id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("anime_status" as any).upsert(
        {
          user_id: user.id,
          anime_id: payload.anime_id,
          anime_title: payload.anime_title,
          anime_image: payload.anime_image ?? null,
          status: payload.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,anime_id" }
      );
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["anime-status"] });
      qc.invalidateQueries({ queryKey: ["anime-status-list"] });
      qc.invalidateQueries({ queryKey: ["user-stats"] });
      toast({
        title: v.status ? `Marked as ${v.status}` : "Removed from list",
      });
    },
    onError: (e: any) =>
      toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });
}

export function useAnimeStatusList(userId?: string, status?: AnimeStatusValue) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  return useQuery({
    queryKey: ["anime-status-list", targetId, status],
    queryFn: async () => {
      if (!targetId) return [];
      let q = supabase
        .from("anime_status" as any)
        .select("*")
        .eq("user_id", targetId)
        .order("updated_at", { ascending: false });
      if (status) q = q.eq("status", status);
      const { data } = await q;
      return ((data as any) as AnimeStatusRow[]) ?? [];
    },
    enabled: !!targetId,
  });
}
