import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://okkupxjkocgasztfldak.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ra3VweGprb2NnYXN6dGZsZGFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU0MjgwNSwiZXhwIjoyMDk3MTE4ODA1fQ.CKg9c5LYzb1vSeiAWfHFZf_A8uEG9BqNbQeo-WYJnq8";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: displayName ? { display_name: displayName } : {},
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.msg || data.message || "Signup failed" }, { status: res.status });
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
