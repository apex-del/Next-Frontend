"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://files.catbox.moe/b96o7h.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 z-[1] bg-gradient-to-t from-black/60 to-transparent" />

      <div className="fixed z-[2] bottom-20 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-[160px] font-black leading-none text-white tracking-tight drop-shadow-[0_0_60px_rgba(124,58,237,0.3)]">
          404
        </h1>
        <p className="text-sm text-white/60 mt-2 font-normal tracking-wide">
          Even Zoro got lost finding this page
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
