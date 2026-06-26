export const runtime = "nodejs";


import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Backend client with service role
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

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { email, password } = await req.json();

  const { data, error } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Insert login log
  const { data: insertData, error: insertError } = await supabaseServer
    .from("user_login_logs")
    .insert({
      user_id: data.user.id,
      email,
      ip_address: ip,
    })
    .select();
  
  console.log("SERVICE ROLE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("SERVICE ROLE KEY LENGTH:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
  console.log("INSERT DATA:", insertData);
  console.log("INSERT ERROR:", insertError);

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}

