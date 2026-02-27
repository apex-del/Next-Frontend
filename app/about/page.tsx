"use client";

import { Info, Shield, Globe, Heart, Code, Download } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function About() {
  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Download className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-extrabold">
                About Anime<span className="text-primary">Stream</span>
              </h1>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  What is AnimeStream?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AnimeStream is your ultimate anime discovery platform. Browse thousands of anime titles,
                  track your watching progress, save favorites, and discover new series through personalized
                  recommendations. Powered by the Jikan API (MyAnimeList), we provide comprehensive anime
                  data including synopses, ratings, episode lists, character info, and more.
                </p>
              </div>

              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Features
                </h2>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Browse and search thousands of anime titles</li>
                  <li>• Track your watch history and progress</li>
                  <li>• Save your favorite anime to a personal list</li>
                  <li>• View detailed anime info: characters, trailers, stats</li>
                  <li>• Weekly airing schedule</li>
                  <li>• Genre-based browsing and discovery</li>
                  <li>• Top charts and random anime discovery</li>
                  <li>• Community comments on every anime page</li>
                </ul>
              </div>

              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Data
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your data is stored securely and is only visible to you. We don&apos;t share your personal
                  information with third parties. All anime data is sourced from the public Jikan/MAL API.
                </p>
              </div>

              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Technology
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Built with React, TypeScript, Tailwind CSS, and Framer Motion. Data provided by the
                  Jikan REST API (unofficial MyAnimeList API).
                </p>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground mb-3">Have feedback or found a bug?</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
