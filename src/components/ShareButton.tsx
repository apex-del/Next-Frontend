"use client";

import { useState } from "react";
import { Share2, Check, Copy, Twitter, Facebook, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Props {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: "icon" | "button";
}

export default function ShareButton({ title, text, url, className, variant = "button" }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "AnimeStream";
  const shareText = text || title || "Check this out on AnimeStream";

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it with your friends!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it with your friends!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trigger =
    variant === "icon" ? (
      <button
        aria-label="Share"
        className={`p-2 rounded-lg border bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ${className || ""}`}
      >
        <Share2 className="h-4 w-4" />
      </button>
    ) : (
      <button
        className={`inline-flex items-center gap-1.5 rounded-lg border bg-secondary border-border px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ${className || ""}`}
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={async (e) => {
        const ok = await nativeShare();
        if (ok) e.preventDefault();
      }}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-4 w-4" /> Twitter / X
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Send className="h-4 w-4" /> Telegram
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="h-4 w-4" /> Facebook
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
