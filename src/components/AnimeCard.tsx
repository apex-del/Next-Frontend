import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { JikanAnime } from "@/lib/jikan";
import { getDisplayTitle } from "@/lib/jikan";

interface AnimeCardProps {
  anime: JikanAnime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/anime/${anime.mal_id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-card transition-all duration-300 card-glow group-hover:card-glow-hover group-hover:scale-[1.03]">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
              alt={getDisplayTitle(anime)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rating badge */}
            {anime.score && (
              <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-2 py-1">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold">{anime.score}</span>
              </div>
            )}

            {/* Type badge */}
            <div className="absolute top-2 right-2 rounded-md bg-primary/90 px-2 py-0.5">
              <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
                {anime.type}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {getDisplayTitle(anime)}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              {anime.year && <span>{anime.year}</span>}
              {anime.episodes && (
                <>
                  <span>•</span>
                  <span>{anime.episodes} eps</span>
                </>
              )}
            </div>
            {anime.genres?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
