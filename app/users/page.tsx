"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PublicUser {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allUsers, setAllUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "";

  useEffect(() => {
    fetch(`${workerUrl}/api/users/search`)
      .then((r) => r.json())
      .then((data) => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => setAllUsers([]))
      .finally(() => setLoading(false));
  }, [workerUrl]);

  const filtered = query.trim()
    ? allUsers.filter((u) => {
        const q = query.trim().toLowerCase();
        return (
          u.display_name?.toLowerCase().includes(q) ||
          u.user_id.toLowerCase().includes(q) ||
          u.bio?.toLowerCase().includes(q)
        );
      })
    : allUsers;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="text-center mb-10">
          <User className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-extrabold">Find Users</h1>
          <p className="text-muted-foreground mt-2">
            Search by display name or user ID &mdash; results update as you type
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Your user ID is shown on your profile page next to your name &mdash; click it to copy
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or user ID..."
            className="w-full rounded-xl bg-secondary pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>{query.trim() ? "No users match your search" : "No public profiles found"}</p>
              <p className="text-sm mt-1">Set your profile to public in settings to appear here</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-medium">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                {query.trim() && ` for "${query.trim()}"`}
              </p>
              {filtered.map((u) => (
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
