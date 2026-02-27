import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GenreFilterProps {
  genres: Array<{ mal_id: number; name: string }>;
  selected: string;
  onSelect: (genreId: string) => void;
}

export default function GenreFilter({
  genres,
  selected,
  onSelect,
}: GenreFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto hide-scrollbar px-1 py-1"
      >
        <button
          onClick={() => onSelect("")}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            selected === ""
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.mal_id}
            onClick={() => onSelect(String(genre.mal_id))}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all whitespace-nowrap ${
              selected === String(genre.mal_id)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
