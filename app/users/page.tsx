"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface PublicUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from("profiles" as any)
        .select("user_id,display_name,avatar_url,bio,created_at")
        .eq("public_profile", true)
        .or(`display_name.ilike.%${q}%,user_id::text.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setUsers((data || []) as PublicUser[]);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="text-center mb-10">
          <User className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-extrabold">Find Users</h1>
          <p className="text-muted-foreground mt-2">
            Search by display name or user ID
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Your user ID is shown on your profile page next to your name &mdash; click it to copy
          </p>
        </div>

        <form onSubmit={doSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or user ID..."
              className="w-full rounded-xl bg-secondary pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No users match your search</p>
              <p className="text-sm mt-1">Try a different name or user ID</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-medium">
                {users.length} result{users.length !== 1 ? "s" : ""} for &quot;{query.trim()}&quot;
              </p>
              {users.map((u) => (
                <Link
                  key={u.user_id}
                  href={`/profile/${u.user_id}`}
                  className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:bg-accent transition-colors group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(u.display_name?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{u.display_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {u.bio || "No bio"} &middot; ID: {u.user_id.slice(0, 8)}...
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
