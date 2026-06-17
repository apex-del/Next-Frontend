import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface FollowProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useFollowList(userId?: string, type: "followers" | "following" = "followers") {
  return useQuery({
    queryKey: ["follow-list", userId, type],
    queryFn: async (): Promise<FollowProfile[]> => {
      if (!userId) return [];
      const selectCol = type === "followers" ? "follower_id" : "following_id";
      const matchCol = type === "followers" ? "following_id" : "follower_id";
      const { data: rows } = await supabase
        .from("follows" as any)
        .select(selectCol)
        .eq(matchCol, userId);
      const ids = (rows ?? []).map((r: any) => r[selectCol]).filter(Boolean);
      if (ids.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", ids);
      return (profiles ?? []) as FollowProfile[];
    },
    enabled: !!userId,
  });
}

export function useSuggestedUsers(excludeId?: string, limit = 12) {
  return useQuery({
    queryKey: ["suggested-users", excludeId, limit],
    queryFn: async (): Promise<FollowProfile[]> => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .order("created_at", { ascending: false })
        .limit(limit + 1);
      return ((data ?? []) as FollowProfile[]).filter((p) => p.user_id !== excludeId).slice(0, limit);
    },
  });
}

export function useFollowCounts(userId?: string) {
  return useQuery({
    queryKey: ["follow-counts", userId],
    queryFn: async () => {
      if (!userId) return { followers: 0, following: 0 };
      const [followers, following] = await Promise.all([
        supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("follower_id", userId),
      ]);
      return { followers: followers.count ?? 0, following: following.count ?? 0 };
    },
    enabled: !!userId,
  });
}

export function useIsFollowing(targetId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-following", user?.id, targetId],
    queryFn: async () => {
      if (!user || !targetId) return false;
      const { data } = await supabase
        .from("follows" as any)
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!targetId,
  });
}

export function useToggleFollow() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, isFollowing }: { targetId: string; isFollowing: boolean }) => {
      if (!user) throw new Error("Sign in required");
      if (isFollowing) {
        const { error } = await supabase
          .from("follows" as any)
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows" as any)
          .insert({ follower_id: user.id, following_id: targetId } as any);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["is-following"] });
      qc.invalidateQueries({ queryKey: ["follow-counts"] });
      toast({ title: v.isFollowing ? "Unfollowed" : "Following" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });
}
