"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import TradingCourseApp from "./TradingCourseApp";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 1. Force logout every time page loads
    supabase.auth.signOut().then(() => {
      // 🔥 2. After logout, always send user to login
      router.push("/auth/login");
    });

    // Prevent flashing of page
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Logging out…
      </div>
    );
  }

  return null; // user will never reach this component
}
