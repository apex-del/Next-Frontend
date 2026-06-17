"use client";

import { useState, useMemo } from "react";
import { MessageCircle, Send, Trash2, LogIn, ThumbsUp, ThumbsDown, Flag, Reply, Pencil, X, Check, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AnimeCommentsProps {
  animeId: number;
}

interface Comment {
  id: string;
  user_id: string;
  anime_id: number;
  content: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
}

interface CommentProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  public_profile: boolean;
}

interface Reaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: "like" | "dislike";
}

type SortMode = "newest" | "oldest" | "top";

export default function AnimeComments({ animeId }: AnimeCommentsProps) {
  const { user } = useAuth();
  const { data: ownProfile } = useQuery({
    queryKey: ["comment-own-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as { avatar_url: string | null; display_name: string | null } | null;
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: allComments = [], isLoading } = useQuery({
    queryKey: ["comments", animeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("anime_id", animeId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Comment[];
    },
    staleTime: 60 * 1000,
  });

  const commentIds = allComments.map((c) => c.id);

  const { data: reactions = [] } = useQuery({
    queryKey: ["comment_reactions", animeId, commentIds.length],
    queryFn: async () => {
      if (commentIds.length === 0) return [];
      const { data, error } = await supabase
        .from("comment_reactions")
        .select("*")
        .in("comment_id", commentIds);
      if (error) throw error;
      return data as Reaction[];
    },
    enabled: commentIds.length > 0,
    staleTime: 30 * 1000,
  });

  const { data: commentProfiles = {} } = useQuery({
    queryKey: ["comment-profiles", animeId, allComments.map((c) => c.user_id).sort().join(",")],
    queryFn: async () => {
      const userIds = Array.from(new Set(allComments.map((c) => c.user_id).filter(Boolean)));
      if (userIds.length === 0) return {} as Record<string, CommentProfile>;
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      if (error) throw error;
      return (data ?? []).reduce((acc, row: any) => {
        acc[row.user_id] = {
          user_id: row.user_id,
          display_name: row.display_name,
          avatar_url: row.avatar_url,
          public_profile: true,
        };
        return acc;
      }, {} as Record<string, CommentProfile>);
    },
    enabled: allComments.length > 0,
    staleTime: 60 * 1000,
  });

  const getReactionCounts = (commentId: string) => {
    const r = reactions.filter((x) => x.comment_id === commentId);
    return {
      likes: r.filter((x) => x.reaction_type === "like").length,
      dislikes: r.filter((x) => x.reaction_type === "dislike").length,
      userReaction: user ? r.find((x) => x.user_id === user.id)?.reaction_type : null,
    };
  };

  const { topLevel, repliesByParent } = useMemo(() => {
    const top = allComments.filter((c) => !c.parent_id);
    const map: Record<string, Comment[]> = {};
    allComments.forEach((c) => {
      if (c.parent_id) {
        if (!map[c.parent_id]) map[c.parent_id] = [];
        map[c.parent_id].push(c);
      }
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    );
    let sorted = [...top];
    if (sort === "oldest") sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else if (sort === "newest") sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    else if (sort === "top") {
      sorted.sort((a, b) => {
        const sa = getReactionCounts(a.id).likes - getReactionCounts(a.id).dislikes;
        const sb = getReactionCounts(b.id).likes - getReactionCounts(b.id).dislikes;
        return sb - sa;
      });
    }
    return { topLevel: sorted, repliesByParent: map };
  }, [allComments, sort, reactions]);

  const toggleReaction = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: "like" | "dislike" }) => {
      if (!user) throw new Error("Not authenticated");
      const existing = reactions.find((r) => r.comment_id === commentId && r.user_id === user.id);
      if (existing) {
        if (existing.reaction_type === type) {
          await supabase.from("comment_reactions").delete().eq("id", existing.id);
        } else {
          await supabase.from("comment_reactions").update({ reaction_type: type }).eq("id", existing.id);
        }
      } else {
        await supabase.from("comment_reactions").insert({
          comment_id: commentId,
          user_id: user.id,
          reaction_type: type,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comment_reactions", animeId] }),
  });

  const addComment = useMutation({
    mutationFn: async ({ text, parent_id }: { text: string; parent_id?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "User";
      const { error } = await supabase.from("comments").insert({
        user_id: user.id,
        anime_id: animeId,
        content: text.trim(),
        display_name: displayName,
        parent_id: parent_id || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
      if (vars.parent_id) {
        setReplyTo(null);
        setReplyContent("");
        toast({ title: "Reply posted!" });
      } else {
        setContent("");
        toast({ title: "Comment posted!" });
      }
    },
    onError: () => toast({ title: "Failed to post", variant: "destructive" }),
  });

  const editComment = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase
        .from("comments")
        .update({ content: text.trim(), updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
      setEditingId(null);
      setEditContent("");
      toast({ title: "Comment updated" });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", animeId] });
      toast({ title: "Comment deleted" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 2 || content.trim().length > 1000) return;
    addComment.mutate({ text: content });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const { likes, dislikes, userReaction } = getReactionCounts(comment.id);
    const replies = repliesByParent[comment.id] || [];
    const isEditing = editingId === comment.id;
    const isOwner = user?.id === comment.user_id;
    const edited = comment.updated_at && comment.updated_at !== comment.created_at;

    const profile = commentProfiles[comment.user_id];
    const avatarName = profile?.display_name || comment.display_name || "Anonymous";
    const profileHref = profile?.public_profile === false ? null : `/profile/${comment.user_id}`;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`rounded-lg bg-card border border-border p-3 sm:p-4 group ${isReply ? "ml-4 sm:ml-8 mt-2" : ""}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 border border-border">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={avatarName} />
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                {avatarName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-x-2">
                {profileHref ? (
                  <Link href={profileHref} className="text-xs sm:text-sm font-medium truncate hover:text-primary transition-colors">
                    {avatarName}
                  </Link>
                ) : (
                  <span className="text-xs sm:text-sm font-medium truncate">{avatarName}</span>
                )}
                <span className="text-[10px] sm:text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                {edited && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
              </div>
            </div>
          </div>
          {isOwner && !isEditing && (
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                className="p-1.5 rounded text-muted-foreground hover:text-primary"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove your comment{replies.length > 0 ? ` and its ${replies.length} repl${replies.length === 1 ? "y" : "ies"}` : ""}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteComment.mutate(comment.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 pl-9 sm:pl-11 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => editComment.mutate({ id: comment.id, text: editContent })}
                disabled={editContent.trim().length < 2}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                <Check className="h-3 w-3" /> Save
              </button>
              <button
                onClick={() => { setEditingId(null); setEditContent(""); }}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-9 sm:pl-11 mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 pl-9 sm:pl-11 mt-2">
            <button
              onClick={() => user && toggleReaction.mutate({ commentId: comment.id, type: "like" })}
              disabled={!user}
              className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 transition-colors ${
                userReaction === "like"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              } disabled:opacity-50`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => user && toggleReaction.mutate({ commentId: comment.id, type: "dislike" })}
              disabled={!user}
              className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 transition-colors ${
                userReaction === "dislike"
                  ? "bg-destructive/15 text-destructive"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              } disabled:opacity-50`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{dislikes}</span>
            </button>
            {!isReply && user && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground rounded-md px-2 py-1 hover:bg-secondary"
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
            )}
            <CommentReportButton commentId={comment.id} />
          </div>
        )}

        {replyTo === comment.id && (
          <div className="mt-3 pl-9 sm:pl-11 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.display_name || "user"}...`}
              rows={2}
              maxLength={1000}
              className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => addComment.mutate({ text: replyContent, parent_id: comment.id })}
                disabled={replyContent.trim().length < 2 || addComment.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-3 w-3" /> Reply
              </button>
              <button
                onClick={() => { setReplyTo(null); setReplyContent(""); }}
                className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((r) => renderComment(r, true))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <section className="mt-8 sm:mt-12">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments
          {allComments.length > 0 && (
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">({allComments.length})</span>
          )}
        </h2>
        <div className="flex items-center gap-1 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          {(["newest", "oldest", "top"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2 py-1 rounded-md capitalize transition-colors ${
                sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2 sm:gap-3">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 mt-0.5 border border-border">
              <AvatarImage src={ownProfile?.avatar_url ?? undefined} alt={ownProfile?.display_name || "Your avatar"} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {(ownProfile?.display_name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 min-w-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={1000}
                className="w-full rounded-lg bg-card border border-border px-3 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs text-muted-foreground">{content.length}/1000</span>
                <button
                  type="submit"
                  disabled={content.trim().length < 2 || addComment.isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {addComment.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg bg-card border border-border p-5 sm:p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Sign in to join the discussion</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-secondary" />
                <div className="h-4 w-24 bg-secondary rounded" />
              </div>
              <div className="h-4 w-full bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {topLevel.map((c) => renderComment(c))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function CommentReportButton({ commentId }: { commentId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    await supabase.from("reports").insert({
      user_id: user?.id || null,
      report_type: "comment",
      message: `Comment ID: ${commentId}. ${message.trim() || "Reported comment"}`,
    });
    setLoading(false);
    toast({ title: "Comment reported. Thank you!" });
    setMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive rounded-md px-2 py-1 hover:bg-secondary"
          title="Report"
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this comment</DialogTitle>
        </DialogHeader>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why are you reporting this comment? (optional)"
          rows={4}
          maxLength={500}
          className="w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="rounded-lg bg-secondary px-3 py-2 text-sm hover:bg-surface-hover">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
            {loading ? "Reporting..." : "Submit Report"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
