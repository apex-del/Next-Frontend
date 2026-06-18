import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ApexAnime - Watch Anime Online",
    template: "%s | ApexAnime",
  },
  description: "Stream and download your favorite anime shows. Browse the latest anime, track your watch history, and save favorites.",
  keywords: ["anime", "stream", "watch anime", "download anime", "anime online"],
  authors: [{ name: "ApexAnime" }],
  creator: "ApexAnime",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://apexanime.com",
    siteName: "ApexAnime",
    title: "ApexAnime - Watch Anime Online",
    description: "Stream and download your favorite anime shows.",
    images: [
      {
        url: "https://apexanime.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApexAnime",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApexAnime - Watch Anime Online",
    description: "Stream and download your favorite anime shows.",
    images: ["https://apexanime.com/og-image.png"],
  },
  alternates: {
    canonical: "https://apexanime.com",
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
        <link rel="icon" href="/jolly-roger.png" type="image/png" />
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3GRYCQM2RL"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3GRYCQM2RL');
            `,
          }}
        />
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
