import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("🔥 create-user route HIT");

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" });
  }

  console.log("SERVICE KEY LOADED:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("❌ ERROR CREATING USER:", error);
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({ success: true, user: data });
}
