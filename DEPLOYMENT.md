# Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Create an account at cloudflare.com
2. **Node.js**: Ensure you have Node.js 18+ installed
3. **npm or bun**: Package manager

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration (optional - defaults to Jikan API)
NEXT_PUBLIC_API_URL=https://api.jikan.moe/v4
```

## Build and Deploy

### Option 1: Cloudflare Pages (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy .next
   ```

### Option 2: Vercel

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

## Cloudflare Worker Setup

The Worker provides API caching to reduce Jikan API calls.

1. **Create KV Namespace**:
   ```bash
   wrangler kv:namespace create ANIME_CACHE
   ```

2. **Deploy Worker**:
   ```bash
   cd worker
   npm install
   wrangler deploy
   ```

3. **Update wrangler.toml** with your namespace ID

## Project Structure

```
anime-stream/
├── app/                    # Next.js App Router
│   ├── anime/[id]/       # Dynamic anime details page
│   ├── auth/             # Authentication page
│   ├── browse/           # Browse/search page
│   ├── favorites/        # User favorites
│   ├── history/          # Watch history
│   ├── settings/         # User settings
│   ├── globals.css       # Global styles (unchanged)
│   ├── layout.tsx        # Root layout with SEO
│   ├── page.tsx          # Home page
│   └── providers.tsx     # React Query & UI providers
├── src/
│   ├── components/       # Reusable components (unchanged)
│   ├── hooks/           # React hooks (unchanged)
│   ├── integrations/    # Supabase client
│   └── lib/            # Jikan API utilities
├── worker/              # Cloudflare Worker
├── public/              # Static assets
├── next.config.ts       # Next.js config
├── wrangler.toml        # Worker config
└── package.json
```

## SEO Features

Each anime page includes:
- Dynamic title (e.g., "Naruto | AnimeStream")
- Meta description from anime synopsis
- Open Graph tags for social sharing
- Canonical URLs
- Twitter Card support

## Performance Optimizations

- Server components for initial data fetching
- Client components only where interactivity is needed
- React Query for caching API responses
- Image optimization with Next.js Image component
- Static generation for SEO-critical pages
