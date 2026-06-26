"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import TradingCourseApp from "./TradingCourseApp";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user WITHOUT logging them out
    supabase.auth.getUser().then((res) => {
      if (!res.data.user) {
        router.push("/auth/login");
      } else {
        setUser(res.data.user);
      }
      setLoading(false);
    });
  }, []);

  // 🔥 Logout ONLY when the user refreshes the protected page
  useEffect(() => {
    const handleRefresh = () => {
      supabase.auth.signOut();
    };

    window.addEventListener("beforeunload", handleRefresh);
    return () => window.removeEventListener("beforeunload", handleRefresh);
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white">Checking access…</div>;
  }

  if (!user) return null;
  return <TradingCourseApp />;
}
