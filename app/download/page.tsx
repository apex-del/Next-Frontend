"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Download as DownloadIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const services = [
  { name: "MixDrop", domain: "mixdrop.ag", color: "from-blue-500 to-cyan-500", icon: "💧" },
  { name: "AnonFile", domain: "anonfile.com", color: "from-green-500 to-emerald-500", icon: "📁" },
  { name: "FilePress", domain: "filepress.io", color: "from-purple-500 to-pink-500", icon: "📦" },
  { name: "DDownload", domain: "ddownload.com", color: "from-orange-500 to-red-500", icon: "⬇️" },
  { name: "MediaFire", domain: "mediafire.com", color: "from-blue-600 to-indigo-600", icon: "🔥" },
  { name: "Mega", domain: "mega.nz", color: "from-red-500 to-rose-500", icon: "☁️" },
  { name: "GoFile", domain: "gofile.io", color: "from-teal-500 to-green-500", icon: "📤" },
  { name: "PixelDrain", domain: "pixeldrain.com", color: "from-violet-500 to-purple-500", icon: "🌐" },
];

function DownloadContent() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const title = searchParams.get("title") || "Unknown Anime";
  const episode = searchParams.get("ep") || "1";
  const animeId = searchParams.get("id") || "";

  const searchQuery = `${title} Episode ${episode} download`;

  return (
    <div className="container mx-auto px-4 pt-20 pb-12">
      <Link
        href={animeId ? `/anime/${animeId}` : "/"}
        className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Anime
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          <DownloadIcon className="inline h-6 w-6 text-primary mr-2" />
          Download Episode {episode}
        </h1>
        <p className="text-muted-foreground">{title}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 mb-8"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-destructive mb-2">Important Safety Notice</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Please use a <strong className="text-foreground">VPN</strong> when visiting third-party download sites for your privacy and security.</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Use an <strong className="text-foreground">Ad Blocker</strong> (like uBlock Origin) to avoid malicious ads and popups.</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>We are <strong className="text-foreground">NOT responsible</strong> for any ads, popups, or content shown on third-party websites.</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Never download <strong className="text-foreground">.exe files</strong> from these sites only video files (.mkv, .mp4).</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      <h2 className="text-lg font-bold mb-4">Choose a Download Source</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {services.map((svc, i) => (
          <motion.a
            key={svc.name}
            href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery + " " + svc.domain)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:card-glow-hover"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${svc.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className="relative flex items-center gap-3">
              <span className="text-3xl">{svc.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold group-hover:text-primary transition-colors">{svc.name}</h3>
                <p className="text-xs text-muted-foreground">{svc.domain}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Can&apos;t find your episode? Try a direct search:</p>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Search on Google
        </a>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <DownloadContent />
      </Suspense>
    </Layout>
  );
}
