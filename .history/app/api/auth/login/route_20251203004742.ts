import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // USE SERVICE ROLE HERE
);

export async function POST(req: Request) {
  // Get real IP
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

  // Insert login log
// Insert login log (debug mode)
const { data: insertData, error: insertError } = await supabase
  .from("user_login_logs")
  .insert({
    user_id: data.user.id,
    email,
    ip_address: ip,
  })
  .select();

console.log("INSERT DATA:", insertData);
console.log("INSERT ERROR:", insertError);
