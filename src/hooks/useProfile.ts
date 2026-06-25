import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  public_profile: boolean;
  default_stream_type: string | null;
  default_server: string | null;
  default_shortener: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;

  return useQuery({
    queryKey: ["profile", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const row = data as any;
      return {
        id: row.id,
        user_id: row.user_id,
        display_name: row.display_name ?? null,
        avatar_url: row.avatar_url ?? null,
        bio: row.bio ?? null,
        public_profile: row.public_profile ?? true,
        default_stream_type: row.default_stream_type ?? null,
        default_server: row.default_server ?? null,
        default_shortener: row.default_shortener ?? null,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as Profile;
    },
    enabled: !!targetId,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      patch: Partial<Pick<Profile, "display_name" | "avatar_url" | "bio" | "public_profile" | "default_stream_type" | "default_server" | "default_shortener">>
    ) => {
      if (!user) throw new Error("Must be signed in");
      const { error } = await supabase
        .from("profiles")
        .update(patch as any)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (e: any) =>
      toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });
}

export function useUserStats(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  return useQuery({
    queryKey: ["user-stats", targetId],
    queryFn: async () => {
      if (!targetId) return { favorites: 0, watched: 0, comments: 0 };
      const [fav, watched, com] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", targetId),
        supabase
          .from("anime_status" as any)
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetId)
          .eq("status", "watched"),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("user_id", targetId),
      ]);
      return {
        favorites: fav.count ?? 0,
        watched: watched.count ?? 0,
        comments: com.count ?? 0,
      };
    },
    enabled: !!targetId,
  });
}

export function useRecentActivity(userId?: string) {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  return useQuery({
    queryKey: ["recent-activity", targetId],
    queryFn: async () => {
      if (!targetId) return { favorites: [], history: [], comments: [] };
      const [fav, hist, com] = await Promise.all([
        supabase.from("favorites").select("*").eq("user_id", targetId).order("created_at", { ascending: false }).limit(6),
        supabase.from("watch_history").select("*").eq("user_id", targetId).order("watched_at", { ascending: false }).limit(6),
        supabase.from("comments").select("*").eq("user_id", targetId).order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        favorites: (fav.data as any[]) ?? [],
        history: (hist.data as any[]) ?? [],
        comments: (com.data as any[]) ?? [],
      };
    },
    enabled: !!targetId,
  });
}
