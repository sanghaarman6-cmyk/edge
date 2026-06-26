import { NextResponse } from 'next/server';
import { supabase } from '@/supabaseClient';

export async function POST(req: Request) {
  // Get IP address
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Store login record
  await supabase.from("user_login_logs").insert({
    user_id: data.user.id,
    email,
    ip_address: ip,
  });

  return NextResponse.json({ user: data.user });
}
const { error: insertError } = await supabase
  .from("user_login_logs")
  .insert({
    user_id: data.user.id,
    email,
    ip_address: ip,
  });

if (insertError) {
  console.log("INSERT FAILED:", insertError);
}

