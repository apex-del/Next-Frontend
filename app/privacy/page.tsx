"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Cookie,
  Database,
  Eye,
  Trash2,
  Mail,
  Lock,
  Globe,
  Download,
  AlertTriangle,
} from "lucide-react";
import Layout from "@/components/Layout";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    content: "When you create an account, we collect your email address and display name. If you sign in with Google, we receive your email, name, and avatar URL from Google. We also collect your anime favorites, watch history, anime status entries, comments, and follow relationships to provide core functionality.",
  },
  {
    icon: Eye,
    title: "How We Use Your Data",
    content: "Your data is used solely to operate and improve the service: saving your favorites, tracking your watch history, enabling comments, managing your anime status list, and personalizing your experience. We do not sell, rent, or share your personal data with third parties for marketing purposes.",
  },
  {
    icon: Cookie,
    title: "Cookies & Local Storage",
    content: "We use cookies and local storage to keep you signed in across sessions, remember your preferences (such as theme), and maintain the functionality of the site. Cloudflare Turnstile, used for spam protection on sign-up, may also set cookies. You can clear these at any time in your browser settings.",
  },
  {
    icon: Globe,
    title: "Third-Party Services",
    content: "AnimeStream embeds video content from third-party hosting services such as Vidara, TurboVid, and others. These services may collect data, set cookies, or track users according to their own privacy policies. We do not control and are not responsible for their practices. We also use MyAnimeList's Jikan API for anime metadata.",
  },
  {
    icon: Shield,
    title: "Data Security",
    content: "We implement reasonable security measures to protect your data, including secure HTTPS connections, Row Level Security (RLS) policies in Supabase, and authentication via Supabase Auth. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    icon: Lock,
    title: "Public Profile",
    content: "You can control whether your profile is publicly visible from your Settings page. When public, other users can view your profile, see your comments, anime status, and follow you. When private, your profile is hidden from other users.",
  },
  {
    icon: Trash2,
    title: "Data Retention & Deletion",
    content: "We retain your data as long as your account is active. You can delete individual items (favorites, history entries, comments) at any time through the interface. To delete your entire account and all associated data, contact us through the contact page. Data will be permanently removed within 30 days of deletion request.",
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: "For privacy-related inquiries or data deletion requests, please reach out through our contact page. We will respond within a reasonable timeframe.",
  },
];

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-7 w-7 text-primary" />
              <h1 className="text-3xl md:text-4xl font-extrabold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground mb-2">Last updated: June 2026</p>
            <p className="text-sm text-muted-foreground mb-10">
              How we collect, use, and protect your data.
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
              AnimeStream respects your privacy. This policy explains what data we collect, why we collect it,
              and how you can control it. We do <strong>not</strong> host or distribute any video files — all
              embedded content comes from third-party services.
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
                <h3 className="font-semibold mb-1">No Video Content Hosted</h3>
                <p className="text-sm text-muted-foreground">
                  AnimeStream does not store, host, or distribute any video files, episodes, or copyrighted
                  media. All video content is embedded from third-party services. We cannot control or be held
                  responsible for the content hosted on external platforms.
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
