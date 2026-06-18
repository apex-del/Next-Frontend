"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User, Camera, Heart, MessageSquare, Edit2, Save, X, Check,
  Clock, Eye, CalendarClock, XCircle, UserPlus, UserCheck, BarChart3, Users,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile, useUserStats, useRecentActivity } from "@/hooks/useProfile";
import { useAnimeStatusList, type AnimeStatusValue } from "@/hooks/useAnimeStatus";
import { useFollowCounts, useIsFollowing, useToggleFollow, useSuggestedUsers } from "@/hooks/useFollows";
import FollowListDialog from "@/components/FollowListDialog";
import ShareButton from "@/components/ShareButton";
import { supabase } from "@/integrations/supabase/client";
import { makeAnimeSlug } from "@/lib/slug";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type TabKey = "overview" | "watched" | "watching" | "planning" | "dropped" | "recent" | "favorites";

const STATUS_TABS: { key: AnimeStatusValue; label: string; icon: any }[] = [
  { key: "watched", label: "Watched", icon: Check },
  { key: "watching", label: "Watching", icon: Eye },
  { key: "planning", label: "Planning", icon: CalendarClock },
  { key: "dropped", label: "Dropped", icon: XCircle },
];

export default function ProfileContent() {
  const params = useParams();
  const userId = params.userId as string | undefined;
  const { user } = useAuth();
  const ownerId = userId ?? user?.id;
  const isOwn = !!user && ownerId === user.id;

  const { data: profile, isLoading } = useProfile(ownerId);
  const { data: stats } = useUserStats(ownerId);
  const { data: activity } = useRecentActivity(ownerId);
  const { data: allStatus = [] } = useAnimeStatusList(ownerId);
  const { data: follow } = useFollowCounts(ownerId);
  const { data: isFollowing = false } = useIsFollowing(isOwn ? undefined : ownerId);
  const { data: suggested = [] } = useSuggestedUsers(user?.id);
  const toggleFollow = useToggleFollow();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [tab, setTab] = useState<TabKey>("overview");
  const [followDialog, setFollowDialog] = useState<null | "followers" | "following">(null);

  const byStatus = useMemo(() => {
    const m: Record<string, typeof allStatus> = { watched: [], watching: [], planning: [], dropped: [] };
    allStatus.forEach((a) => { (m[a.status] ||= []).push(a); });
    return m;
  }, [allStatus]);

  const startEdit = () => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateProfile.mutateAsync({ display_name: displayName.trim() || null, bio: bio.trim() || null });
    setEditing(false);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await updateProfile.mutateAsync({ avatar_url: data.publicUrl });
  };

  if (!ownerId) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 gap-4">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Sign in to view your profile</h2>
          <Link href="/auth" className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium">
            Sign In
          </Link>
        </div>
      </Layout>
    );
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "watched", label: "Watched", count: byStatus.watched.length },
    { key: "watching", label: "Watching", count: byStatus.watching.length },
    { key: "planning", label: "Planning", count: byStatus.planning.length },
    { key: "dropped", label: "Dropped", count: byStatus.dropped.length },
    { key: "recent", label: "Recently Watched", count: activity?.history?.length },
    { key: "favorites", label: "Favorites", count: activity?.favorites?.length },
  ];

  const isPrivateProfile = !isOwn && profile?.public_profile === false;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-4xl">
        {isPrivateProfile ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">This profile is private</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              This user turned off public profile viewing, so their activity and lists are hidden.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {(profile?.display_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOwn && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                      aria-label="Change avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  <input
                    ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
                  />
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                  {editing ? (
                    <div className="space-y-3">
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Display name"
                        className="w-full rounded-lg bg-secondary px-3 py-2 text-lg font-bold outline-none focus:ring-1 focus:ring-primary"
                      />
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell people about yourself..."
                        rows={3}
                        maxLength={300}
                        className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <button onClick={saveEdit} disabled={updateProfile.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                          <Save className="h-4 w-4" /> Save
                        </button>
                        <button onClick={() => setEditing(false)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium">
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold">
                          {profile?.display_name || "Unnamed user"}
                        </h1>
                        {isOwn ? (
                          <button onClick={startEdit}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : user ? (
                          <button
                            onClick={() => ownerId && toggleFollow.mutate({ targetId: ownerId, isFollowing })}
                            disabled={toggleFollow.isPending}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                              isFollowing
                                ? "bg-secondary text-foreground hover:bg-surface-hover"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {isFollowing ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
                          </button>
                        ) : null}
                        <ShareButton
                          variant="icon"
                          title={`${profile?.display_name || "A user"} on ApexAnime`}
                          text={`Check out ${profile?.display_name || "this profile"} on ApexAnime`}
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-4 justify-center sm:justify-start text-sm">
                        <button onClick={() => ownerId && setFollowDialog("followers")} className="hover:text-primary transition-colors">
                          <strong>{follow?.followers ?? 0}</strong> <span className="text-muted-foreground">followers</span>
                        </button>
                        <button onClick={() => ownerId && setFollowDialog("following")} className="hover:text-primary transition-colors">
                          <strong>{follow?.following ?? 0}</strong> <span className="text-muted-foreground">following</span>
                        </button>
                      </div>

                      {profile?.bio && (
                        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                      )}
                      {!profile?.bio && isOwn && (
                        <p className="mt-2 text-sm text-muted-foreground italic">Add a bio to introduce yourself.</p>
                      )}
                      <p className="mt-3 text-xs text-muted-foreground">
                        Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                {[
                  { icon: Heart, label: "Favorites", value: stats?.favorites ?? 0 },
                  { icon: Check, label: "Watched", value: byStatus.watched.length },
                  { icon: Eye, label: "Watching", value: byStatus.watching.length },
                  { icon: CalendarClock, label: "Planning", value: byStatus.planning.length },
                  { icon: XCircle, label: "Dropped", value: byStatus.dropped.length },
                  { icon: MessageSquare, label: "Comments", value: stats?.comments ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-secondary/50 border border-border p-3 text-center">
                    <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-lg sm:text-2xl font-bold">{s.value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                    tab === t.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {typeof t.count === "number" && <span className="ml-1.5 opacity-70">({t.count})</span>}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {tab === "overview" && (
                <div className="space-y-8">
                  <AnimeGrid title="Recently Watched" items={(activity?.history ?? []).slice(0, 6)} subKey="episode_number" />
                  <AnimeGrid title="Favorites" items={(activity?.favorites ?? []).slice(0, 6)} />
                  {(activity?.comments?.length ?? 0) > 0 && (
                    <div>
                      <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Recent Comments</h2>
                      <div className="space-y-2">
                        {activity!.comments.map((c: any) => (
                          <Link key={c.id} href={`/anime/${makeAnimeSlug(c.anime_title, c.anime_id)}`}
                            className="block rounded-lg bg-card border border-border p-3 hover:border-primary/30 transition-colors">
                            <p className="text-sm line-clamp-2">{c.content}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {!activity?.history?.length && !activity?.favorites?.length && !activity?.comments?.length && (
                    <EmptyState text="No activity yet." />
                  )}

                  {isOwn && suggested.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Discover People
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {suggested.map((p) => (
                          <Link
                            key={p.user_id}
                            href={`/profile/${p.user_id}`}
                            className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/30 transition-colors min-w-0"
                          >
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={p.avatar_url ?? undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                {(p.display_name?.[0] ?? "U").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate">{p.display_name || "Unnamed user"}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {STATUS_TABS.map((s) => tab === s.key && (
                <AnimeGrid key={s.key} items={byStatus[s.key]} flat empty={`Nothing marked as ${s.label.toLowerCase()} yet.`} />
              ))}

              {tab === "recent" && (
                <AnimeGrid items={activity?.history ?? []} flat subKey="episode_number" empty="No watch history yet." />
              )}

              {tab === "favorites" && (
                <AnimeGrid items={activity?.favorites ?? []} flat empty="No favorites yet." />
              )}
            </div>
          </>
        )}
      </div>

      {ownerId && followDialog && !isPrivateProfile && (
        <FollowListDialog
          userId={ownerId}
          type={followDialog}
          open={!!followDialog}
          onOpenChange={(o) => !o && setFollowDialog(null)}
        />
      )}
    </Layout>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
      {text}
    </div>
  );
}

function AnimeGrid({
  title, items, flat, empty, subKey,
}: { title?: string; items: any[]; flat?: boolean; empty?: string; subKey?: string }) {
  if (!items.length) {
    if (flat) return <EmptyState text={empty || "Nothing here yet."} />;
    return null;
  }
  return (
    <div>
      {title && <h2 className="text-lg font-bold mb-3">{title}</h2>}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((a: any) => (
          <Link key={a.id} href={`/anime/${makeAnimeSlug(a.anime_title, a.anime_id)}`} className="block group">
            {a.anime_image && (
              <img src={a.anime_image} alt={a.anime_title} loading="lazy"
                className="w-full aspect-[3/4] rounded-lg object-cover group-hover:scale-[1.03] transition-transform" />
            )}
            <p className="mt-1.5 text-xs line-clamp-2 group-hover:text-primary transition-colors">{a.anime_title}</p>
            {subKey && a[subKey] != null && (
              <p className="text-[10px] text-muted-foreground">Ep {a[subKey]}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
