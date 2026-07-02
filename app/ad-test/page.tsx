"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

const ADS = [
  {
    id: "pop",
    name: "Popunder (tag.min.js)",
    zone: "11226262",
    src: "https://nap5k.com/tag.min.js",
    desc: "Full-page popunder ad — opens in new tab on user click",
  },
  {
    id: "vignette",
    name: "Vignette (vignette.min.js)",
    zone: "11227970",
    src: "https://n6wxm.com/vignette.min.js",
    desc: "Interstitial overlay — shows between page navigations",
  },
  {
    id: "banner",
    name: "Banner (tag.min.js)",
    zone: "11224691",
    src: "https://al5sm.com/tag.min.js",
    desc: "Display banner ad — injected into page content",
  },
];

export default function AdTestPage() {
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const loadAd = (ad: (typeof ADS)[0]) => {
    if (loaded[ad.id]) return;
    const s = document.createElement("script");
    s.dataset.zone = ad.zone;
    s.src = ad.src;
    document.body.appendChild(s);
    setLoaded((prev) => ({ ...prev, [ad.id]: true }));
  };

  const loadAll = () => {
    ADS.forEach((ad) => loadAd(ad));
  };

  return (
    <Layout>
      <div className="pt-20 pb-10 px-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Ad Test Page</h1>
        <p className="text-sm text-muted-foreground">
          Test each ad type separately. Click Load to inject the script. Check browser console and network tab for ad activity.
        </p>

        <button
          onClick={loadAll}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
        >
          Load All Ads
        </button>

        <div className="grid gap-4">
          {ADS.map((ad) => (
            <div key={ad.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-sm">{ad.name}</h2>
                  <p className="text-xs text-muted-foreground">{ad.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    Zone: {ad.zone} | Src: {ad.src}
                  </p>
                </div>
                <button
                  onClick={() => loadAd(ad)}
                  disabled={loaded[ad.id]}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    loaded[ad.id]
                      ? "bg-green-500/20 text-green-400 cursor-default"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  {loaded[ad.id] ? "Loaded ✓" : "Load"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
          <h2 className="font-semibold text-sm">Monetag Verification</h2>
          <code className="block text-[10px] text-muted-foreground font-mono break-all">
            &lt;meta name=&quot;monetag&quot; content=&quot;e98f681be19545d98687f88348b1183a&quot; /&gt;
          </code>
          <p className="text-xs text-muted-foreground">
            Added to layout.tsx &lt;head&gt;. Verify at monetag dashboard.
          </p>
        </div>
      </div>
    </Layout>
  );
}
