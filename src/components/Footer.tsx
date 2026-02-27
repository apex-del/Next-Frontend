import Link from "next/link";
import { Download, Github, Twitter, Heart } from "lucide-react";

const footerLinks = {
  Browse: [
    { label: "Trending", href: "/browse?sort=popularity" },
    { label: "Top Rated", href: "/browse?sort=score" },
    { label: "New Releases", href: "/browse?sort=start_date" },
    { label: "All Anime", href: "/browse" },
  ],
  Account: [
    { label: "Sign In", href: "/auth" },
    { label: "Favorites", href: "/favorites" },
    { label: "Watch History", href: "/history" },
    { label: "Settings", href: "/settings" },
  ],
  Genres: [
    { label: "Action", href: "/browse?genre=1" },
    { label: "Romance", href: "/browse?genre=22" },
    { label: "Comedy", href: "/browse?genre=4" },
    { label: "Fantasy", href: "/browse?genre=10" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Download className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                Anime<span className="text-primary">Stream</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Your ultimate destination for discovering and downloading anime. Powered by MyAnimeList data.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AnimeStream. Built with{" "}
            <Heart className="inline h-3 w-3 text-primary fill-primary" /> using Jikan API.
          </p>
          <p className="text-xs text-muted-foreground">
            Data sourced from MyAnimeList via Jikan API. Not affiliated with MAL.
          </p>
        </div>
      </div>
    </footer>
  );
}
