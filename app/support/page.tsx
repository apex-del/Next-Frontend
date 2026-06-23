"use client";

import Script from "next/script";
import { Coffee, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

export default function SupportPage() {
  return (
    <Layout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-[#FF5E5B]/10 flex items-center justify-center">
                <Coffee className="h-8 w-8 text-[#FF5E5B]" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold mb-3">
              Support <span className="text-primary">ApexAnime</span>
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed mb-2 max-w-sm mx-auto">
              We work hard to keep this project running &mdash; covering server costs,
              development time, and APIs. If you enjoy using ApexAnime, consider buying us a coffee.
            </p>

            <p className="text-xs text-muted-foreground/60 mb-8 italic">
              No promises, but we&apos;ll do our best to keep things going!
            </p>

            <div className="rounded-xl bg-card border border-border p-8 flex flex-col items-center">
              <div id="kofi-widget" className="min-h-[120px]" />

              <Script
                src="https://storage.ko-fi.com/cdn/widget/Widget_2.js"
                strategy="lazyOnload"
                onLoad={() => {
                  try {
                    const w = (window as any).kofiwidget2;
                    if (w) {
                      w.init("Support Us 💪🏻", "#FF5E5B", "L5O820YNA7");
                      w.draw();
                    }
                  } catch {}
                }}
              />

              <div className="mt-6 pt-4 border-t border-border w-full text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  Made with <Heart className="h-3 w-3 text-primary fill-primary" /> by the ApexAnime team
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
