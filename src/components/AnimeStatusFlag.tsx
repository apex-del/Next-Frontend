"use client";

import { Eye, Bookmark, PlayCircle, XCircle, Check, ChevronDown, Flag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useAnimeStatus,
  useSetAnimeStatus,
  type AnimeStatusValue,
} from "@/hooks/useAnimeStatus";
import { useAuth } from "@/hooks/useAuth";

const OPTIONS: { value: AnimeStatusValue; label: string; icon: typeof Eye; cls: string }[] = [
  { value: "watched",  label: "Watched",   icon: Check,      cls: "text-emerald-400" },
  { value: "watching", label: "Watching",  icon: PlayCircle, cls: "text-sky-400" },
  { value: "planning", label: "Planning",  icon: Bookmark,   cls: "text-amber-400" },
  { value: "dropped",  label: "Dropped",   icon: XCircle,    cls: "text-rose-400" },
];

interface Props {
  animeId: number;
  animeTitle: string;
  animeImage?: string | null;
}

export default function AnimeStatusFlag({ animeId, animeTitle, animeImage }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: current } = useAnimeStatus(animeId);
  const setStatus = useSetAnimeStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = OPTIONS.find((o) => o.value === current?.status);

  const handleSelect = (val: AnimeStatusValue) => {
    if (!user) return router.push("/auth");
    const next = current?.status === val ? null : val;
    setStatus.mutate({ anime_id: animeId, anime_title: animeTitle, anime_image: animeImage, status: next });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => (user ? setOpen((o) => !o) : router.push("/auth"))}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold border transition-all ${
          active
            ? "bg-primary/10 border-primary/40 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        {active ? <active.icon className={`h-3.5 w-3.5 ${active.cls}`} /> : <Flag className="h-3.5 w-3.5" />}
        <span className="hidden xs:inline sm:inline">{active?.label ?? "Add to list"}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 z-40 mt-1.5 w-44 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
          >
            {OPTIONS.map((o) => {
              const selected = o.value === current?.status;
              return (
                <button
                  key={o.value}
                  onClick={() => handleSelect(o.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors ${
                    selected ? "bg-primary/10" : ""
                  }`}
                >
                  <o.icon className={`h-4 w-4 ${o.cls}`} />
                  <span className="flex-1">{o.label}</span>
                  {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
            {current && (
              <button
                onClick={() => handleSelect(current.status)}
                className="w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 border-t border-border"
              >
                Remove from list
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
