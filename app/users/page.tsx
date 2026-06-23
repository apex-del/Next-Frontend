"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, User, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";

const SAFE_USERS = [
  { id: "1", name: "Apex Admin", bio: "Site administrator" },
  { id: "2", name: "Anime Lover", bio: "Loves all genres" },
  { id: "3", name: "SubsPlease", bio: "Sub over dub always" },
];

export default function UsersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/profile/${encodeURIComponent(q)}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="text-center mb-10">
          <User className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-extrabold">Find Users</h1>
          <p className="text-muted-foreground mt-2">
            Search for a user by their ID to view their public profile
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter user ID..."
            className="w-full rounded-xl bg-secondary pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">
            Try these public profiles:
          </p>
          {SAFE_USERS.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.id}`}
              className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 hover:bg-accent transition-colors group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{u.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {u.bio} &middot; ID: {u.id}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
