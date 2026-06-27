"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Coffee, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";

export default function SupportPage() {
  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Support Us
            </h1>
            <p className="text-muted-foreground mb-8">
              Help keep ApexAnime running
            </p>
          </motion.div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card border border-border p-8 text-center">
              <Coffee className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Buy Us a Coffee</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                ApexAnime is built and maintained by anime fans, for anime fans.
                If you enjoy using the site, consider supporting us on Ko-fi.
                Your support helps cover server costs and keeps the site running
                smoothly for everyone.
              </p>
              <a
                href="https://ko-fi.com/L5O820YNA7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Coffee className="h-5 w-5" />
                Support Us on Ko-fi
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary fill-primary" />
                Why Support?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Keep the site ad-free and accessible to everyone
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Cover server and API costs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Fund new features and improvements
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Support independent anime fan projects
                </li>
              </ul>
            </div>

            <div className="rounded-xl bg-card border border-border p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Other Ways to Help
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Can&apos;t donate? No problem! You can still help by sharing the site with friends,
                reporting bugs, or contributing on GitHub. Every bit of support counts!
              </p>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
