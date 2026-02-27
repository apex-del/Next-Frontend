import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AnimeStream - Watch Anime Online",
    template: "%s | AnimeStream",
  },
  description: "Stream and download your favorite anime shows. Browse the latest anime, track your watch history, and save favorites.",
  keywords: ["anime", "stream", "watch anime", "download anime", "anime online"],
  authors: [{ name: "AnimeStream" }],
  creator: "AnimeStream",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com",
    siteName: "AnimeStream",
    title: "AnimeStream - Watch Anime Online",
    description: "Stream and download your favorite anime shows.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AnimeStream",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimeStream - Watch Anime Online",
    description: "Stream and download your favorite anime shows.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
