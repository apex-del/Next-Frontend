"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Download, Heart, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y > 80 && y > lastY.current) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setHidden(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const initial = (profile?.display_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  return (
    <nav
      className={`sticky top-0 z-40 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "glass border-b border-border" : "bg-background/80 backdrop-blur-sm"}`}
    >
      <div className="flex h-14 items-center px-3 sm:px-4 gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          {!searchOpen && (
            <Link href="/" className="flex items-center gap-2 group md:hidden">
              <img src="/logo.png" alt="ApexAnime" className="h-8 w-8" />
              <span className="text-lg font-bold tracking-tight">
                Apex<span className="text-primary">Anime</span>
              </span>
            </Link>
          )}
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-w-0"
            >
              <form onSubmit={handleSearch}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!searchOpen && <div className="flex-1" />}

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={searchOpen ? "Close search" : "Open search"}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {!searchOpen && (
            <>
              <Link
                href="/favorites"
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors hidden sm:flex"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full sm:rounded-lg sm:bg-secondary sm:px-2 sm:py-1 hover:bg-surface-hover transition-colors"
                  aria-label="Profile"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden md:inline truncate max-w-[100px]">
                    {profile?.display_name ?? user.email?.split("@")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
