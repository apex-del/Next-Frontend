"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, Shield, Ban, FileText, AlertTriangle, Download } from "lucide-react";
import Layout from "@/components/Layout";

const sections = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    content: "By accessing or using AnimeStream, you agree to be bound by these Terms of Use and all applicable laws. If you do not agree with any part of these terms, you must not use our service.",
  },
  {
    icon: Ban,
    title: "No Hosting of Copyrighted Content",
    content: "AnimeStream does not host, store, upload, or distribute any video files, episode files, or copyrighted media on its servers. All video content displayed on this website is embedded from third-party services and publicly available sources. We do not control the content hosted on these external platforms.",
  },
  {
    icon: AlertTriangle,
    title: "Disclaimer of Liability",
    content: "AnimeStream is not responsible for the accuracy, legality, or availability of content embedded from third-party services. We do not guarantee that external links or embedded content will be uninterrupted, error-free, or free of harmful components. By using this site, you acknowledge that AnimeStream shall not be held liable for any damages arising from your use of embedded content or external links.",
  },
  {
    icon: Shield,
    title: "Third-Party Services",
    content: "Our service provides links to and embeds content from third-party video hosting platforms and file-sharing services. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of these third-party services. Users access such content at their own risk.",
  },
  {
    icon: Scale,
    title: "User Conduct",
    content: "You agree to use AnimeStream only for lawful purposes. You must not: (a) use the service to infringe upon intellectual property rights; (b) attempt to bypass security measures; (c) scrape, crawl, or automatedly collect data without authorization; (d) use the service for any illegal activity.",
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    content: "All anime titles, images, and metadata displayed on AnimeStream are sourced from the Jikan API (MyAnimeList). All trademarks, logos, and character images belong to their respective owners. AnimeStream is not affiliated with or endorsed by any anime production studio or publisher.",
  },
  {
    icon: Shield,
    title: "Changes to Terms",
    content: "We reserve the right to modify these Terms of Use at any time. Changes will be posted on this page. Your continued use of the service after changes constitutes acceptance of the new terms.",
  },
];

export default function TermsPage() {
  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-7 w-7 text-primary" />
              <h1 className="text-3xl md:text-4xl font-extrabold">Terms of Use</h1>
            </div>
            <p className="text-muted-foreground mb-2">Last updated: June 2026</p>
            <p className="text-sm text-muted-foreground mb-10">
              Please read these terms carefully before using AnimeStream.
            </p>
          </motion.div>

          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">
                Anime<span className="text-primary">Stream</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AnimeStream is a free anime discovery and streaming directory. We aggregate publicly available
              information and embed content from third-party video hosting services. We do not host,
              upload, or distribute any copyrighted media files. All content is provided for informational
              and entertainment purposes only.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card border border-border p-6 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 rounded-xl bg-destructive/5 border border-destructive/20 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Contact for Copyright Concerns</h3>
                <p className="text-sm text-muted-foreground">
                  If you believe any content on AnimeStream infringes your copyright, please contact the
                  respective third-party hosting service directly. We do not host any files and cannot
                  remove content from external platforms. For inquiries, reach us at the contact page.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
