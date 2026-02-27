import { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimeDetailsClient from "./AnimeDetailsClient";
import { getAnimeById } from "@/lib/jikan";

export const runtime = 'edge';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const animeId = Number(id);

  if (isNaN(animeId)) {
    return {
      title: "Anime Not Found",
    };
  }

  try {
    const animeData = await getAnimeById(animeId);
    const anime = animeData.data;

    if (!anime) {
      return {
        title: "Anime Not Found",
      };
    }

    const title = anime.title_english || anime.title;
    const description = anime.synopsis
      ? anime.synopsis.slice(0, 160)
      : `Watch ${title} online. Find episodes, characters, and more information about this anime.`;
    const imageUrl =
      anime.images.webp.large_image_url || anime.images.jpg.large_image_url;

    return {
      title: title,
      description: description,
      openGraph: {
        title: `${title} | AnimeStream`,
        description: description,
        type: "website",
        url: `/anime/${anime.mal_id}`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 1200,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | AnimeStream`,
        description: description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/anime/${anime.mal_id}`,
      },
      other: {
        "og:site_name": "AnimeStream",
      },
    };
  } catch (error) {
    return {
      title: "Anime Details",
    };
  }
}

export default async function AnimeDetailsPage({ params }: Props) {
  const { id } = await params;
  const animeId = Number(id);

  if (isNaN(animeId)) {
    notFound();
  }

  return <AnimeDetailsClient animeId={animeId} />;
}
