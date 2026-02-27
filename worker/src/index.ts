export interface Env {
  ANIME_CACHE: KVNamespace;
  DB: D1Database;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
}

const JIKAN_API = "https://api.jikan.moe/v4";
const RATE_LIMIT_WINDOW = 1000;
const MAX_REQUESTS = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

async function fetchWithCache(
  url: string,
  cache: KVNamespace,
  cacheKey: string,
  cacheDuration: number,
  request: Request
): Promise<Response> {
  const cached = await cache.get(cacheKey);
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "HIT",
        ...corsHeaders,
      },
    });
  }

  await new Promise((r) => setTimeout(r, 350));

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AnimeStreamHub/1.0",
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "API error", status: response.status }), {
      status: response.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const data = await response.text();
  await cache.put(cacheKey, data, { expirationTtl: cacheDuration });

  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "X-Cache": "MISS",
      ...corsHeaders,
    },
  });
}

async function supabaseFetch(
  env: Env,
  path: string,
  method: string,
  body?: object,
  authToken?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "apikey": env.SUPABASE_KEY,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const searchParams = url.search;

    try {
      // Anime endpoints
      if (path.match(/^\/api\/anime\/(\d+)$/) || path.match(/^\/api\/anime\/(\d+)\/full$/)) {
        const animePath = path.replace("/api/anime/", "/");
        const cacheKey = `anime:${animePath}:${searchParams}`;
        return fetchWithCache(
          `${JIKAN_API}/anime${animePath}${searchParams}`,
          env.ANIME_CACHE,
          cacheKey,
          600,
          request
        );
      }

      // Anime episodes
      if (path.match(/^\/api\/anime\/(\d+)\/episodes$/)) {
        const id = path.match(/^\/api\/anime\/(\d+)\/episodes$/)?.[1];
        const cacheKey = `episodes:${id}:${searchParams}`;
        return fetchWithCache(
          `${JIKAN_API}/anime/${id}/episodes${searchParams}`,
          env.ANIME_CACHE,
          cacheKey,
          600,
          request
        );
      }

      // Anime characters
      if (path.match(/^\/api\/anime\/(\d+)\/characters$/)) {
        const id = path.match(/^\/api\/anime\/(\d+)\/characters$/)?.[1];
        const cacheKey = `characters:${id}`;
        return fetchWithCache(
          `${JIKAN_API}/anime/${id}/characters`,
          env.ANIME_CACHE,
          cacheKey,
          3600,
          request
        );
      }

      // Anime relations
      if (path.match(/^\/api\/anime\/(\d+)\/relations$/)) {
        const id = path.match(/^\/api\/anime\/(\d+)\/relations$/)?.[1];
        const cacheKey = `relations:${id}`;
        return fetchWithCache(
          `${JIKAN_API}/anime/${id}/relations`,
          env.ANIME_CACHE,
          cacheKey,
          3600,
          request
        );
      }

      // Anime recommendations
      if (path.match(/^\/api\/anime\/(\d+)\/recommendations$/)) {
        const id = path.match(/^\/api\/anime\/(\d+)\/recommendations$/)?.[1];
        const cacheKey = `recommendations:${id}`;
        return fetchWithCache(
          `${JIKAN_API}/anime/${id}/recommendations`,
          env.ANIME_CACHE,
          cacheKey,
          600,
          request
        );
      }

      // Search
      if (path === "/api/search" || path === "/api/anime") {
        const cacheKey = `search:${searchParams}`;
        return fetchWithCache(
          `${JIKAN_API}/anime${searchParams}`,
          env.ANIME_CACHE,
          cacheKey,
          300,
          request
        );
      }

      // Top anime
      if (path === "/api/top") {
        const cacheKey = `top:${searchParams}`;
        return fetchWithCache(
          `${JIKAN_API}/top/anime${searchParams}`,
          env.ANIME_CACHE,
          cacheKey,
          300,
          request
        );
      }

      // Seasons now
      if (path === "/api/seasons/now") {
        const cacheKey = `seasons:${searchParams}`;
        return fetchWithCache(
          `${JIKAN_API}/seasons/now${searchParams}`,
          env.ANIME_CACHE,
          cacheKey,
          3600,
          request
        );
      }

      // Genres
      if (path === "/api/genres") {
        const cacheKey = "genres:anime";
        return fetchWithCache(
          `${JIKAN_API}/genres/anime`,
          env.ANIME_CACHE,
          cacheKey,
          86400,
          request
        );
      }

      // Favorites (Supabase)
      if (path === "/api/favorites") {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (request.method === "GET") {
          return supabaseFetch(env, `favorites?user_id=eq.${token}&order=created_at.desc`, "GET", undefined, token);
        }

        if (request.method === "POST") {
          const body = await request.json();
          return supabaseFetch(env, "favorites", "POST", body, token);
        }

        if (request.method === "DELETE") {
          const { anime_id } = await request.json();
          return supabaseFetch(env, `favorites?user_id=eq.${token}&anime_id=eq.${anime_id}`, "DELETE", undefined, token);
        }
      }

      // Comments (Supabase)
      if (path === "/api/comments") {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (request.method === "GET") {
          const animeId = url.searchParams.get("anime_id");
          return supabaseFetch(
            env, 
            `comments?anime_id=eq.${animeId}&order=created_at.desc`, 
            "GET", 
            undefined, 
            token
          );
        }

        if (request.method === "POST") {
          const body = await request.json();
          return supabaseFetch(env, "comments", "POST", body, token);
        }

        if (request.method === "DELETE") {
          const { id } = await request.json();
          return supabaseFetch(env, `comments?id=eq.${id}`, "DELETE", undefined, token);
        }
      }

      // Reports (Supabase)
      if (path === "/api/reports") {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (request.method === "POST") {
          const body = await request.json();
          return supabaseFetch(env, "reports", "POST", body, token);
        }
      }

      // Watch History (Supabase)
      if (path === "/api/history") {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (request.method === "GET") {
          return supabaseFetch(env, `watch_history?user_id=eq.${token}&order=created_at.desc&limit=20`, "GET", undefined, token);
        }

        if (request.method === "POST") {
          const body = await request.json();
          return supabaseFetch(env, "watch_history", "POST", body, token);
        }
      }

      return new Response(JSON.stringify({ error: "Not found", path }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Internal server error", message: String(error) }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  },
};
