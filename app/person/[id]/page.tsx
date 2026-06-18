"use client";

export const runtime = "edge";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Film, Users } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { makeAnimeSlug } from "@/lib/slug";

interface PersonFull {
  mal_id: number;
  name: string;
  given_name: string | null;
  family_name: string | null;
  about: string | null;
  favorites: number;
  images: { jpg: { image_url: string } };
  anime: Array<{ position: string; anime: { mal_id: number; title: string; images: { webp: { image_url: string }; jpg: { image_url: string } } } }>;
  voices: Array<{
    role: string;
    anime: { mal_id: number; title: string; images: { webp: { image_url: string }; jpg: { image_url: string } } };
    character: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
  }>;
}

export default function PersonDetail() {
  const params = useParams<{ id: string }>();
  const personId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["person-full", personId],
    queryFn: async () => {
      const res = await fetch(`https://api.jikan.moe/v4/people/${personId}/full`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data as PersonFull;
    },
    enabled: !!personId,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="h-64 rounded-xl bg-card animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Person not found.</p>
          <Link href="/" className="text-primary hover:underline">Go home</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <Link href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-5">
          <img src={data.images.jpg.image_url} alt={data.name} className="w-40 sm:w-52 rounded-xl border border-border object-cover mx-auto sm:mx-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold">{data.name}</h1>
            {(data.given_name || data.family_name) && (
              <p className="text-muted-foreground mt-1">{[data.family_name, data.given_name].filter(Boolean).join(" ")}</p>
            )}
            {typeof data.favorites === "number" && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary"><Heart className="h-4 w-4 fill-primary" /> {data.favorites.toLocaleString()} favorites</p>
            )}
            {data.about && <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-[10]">{data.about}</p>}
          </div>
        </motion.div>

        {data.voices?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Voice Roles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.voices.slice(0, 36).map((v, i) => (
                <Link key={`${v.character.mal_id}-${v.anime.mal_id}-${i}`} href={`/character/${v.character.mal_id}`} className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={v.character.images.jpg.image_url} alt={v.character.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold line-clamp-1">{v.character.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{v.anime.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.anime?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Film className="h-5 w-5 text-primary" /> Staff Work</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {data.anime.slice(0, 24).map((a, i) => (
                <Link key={`${a.anime.mal_id}-${i}`} href={`/anime/${makeAnimeSlug(a.anime.title, a.anime.mal_id)}`} className="rounded-xl bg-card border border-border overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={a.anime.images.webp.image_url || a.anime.images.jpg.image_url} alt={a.anime.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">{a.anime.title}</p>
                    <p className="text-[10px] text-muted-foreground">{a.position}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
