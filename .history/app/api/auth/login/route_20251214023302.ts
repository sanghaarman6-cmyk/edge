export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 🔐 Service role (admin only)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  // ✅ Read body
  const { userId, email } = await req.json();

  if (!userId || !email) {
    return NextResponse.json(
      { error: "Missing userId or email" },
      { status: 400 }
    );
  }

  // 🌍 IP detection (Vercel-safe)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("client-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("fastly-client-ip") ||
    req.headers.get("true-client-ip") ||
    "unknown";

  // 🧾 Insert login log
  const { error } = await supabaseServer
    .from("user_login_logs")
    .insert({
      user_id: userId,
      email,
      ip_address: realIp,
    });

  if (error) {
    console.error("LOGIN LOG INSERT ERROR:", error);
    return NextResponse.json({ error: "Log failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
