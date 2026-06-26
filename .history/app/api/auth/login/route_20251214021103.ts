export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Backend Supabase client (service role)
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
  console.log("LOGIN ROUTE HIT");

  // -------------------------------
  // 🔥 VERCEL-SAFE IP DETECTION
  // -------------------------------
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp =
    forwarded?.split(",")[0]?.trim() || 
    req.headers.get("x-real-ip") ||
    req.headers.get("client-ip") ||
    req.headers.get("cf-connecting-ip") || // Cloudflare
    req.headers.get("fastly-client-ip") || // Fastly
    req.headers.get("true-client-ip") ||   // Akamai
    "unknown";

  console.log("IP DEBUG:", {
    forwarded: req.headers.get("x-forwarded-for"),
    xReal: req.headers.get("x-real-ip"),
    clientIp: req.headers.get("client-ip"),
    cf: req.headers.get("cf-connecting-ip"),
    fastly: req.headers.get("fastly-client-ip"),
    trueClient: req.headers.get("true-client-ip"),
    finalIp: realIp,
    runtime: typeof process !== "undefined" ? process.release?.name : "unknown"
  });

  // Creds
  const { email, password } = await req.json();

  // Login
  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // -------------------------------
  // 🔥 INSERT LOGIN LOG
  // -------------------------------
  const { data: insertData, error: insertError } = await supabaseServer
    .from("user_login_logs")
    .insert({
      user_id: data.user.id,
      email,
      ip_address: realIp,
    });

  if (insertError) {
    console.log("INSERT ERROR:", insertError);
  } else {
    console.log("INSERT SUCCESS:", insertData);
  }

  return NextResponse.json({
    user: data.user,
  });
}
