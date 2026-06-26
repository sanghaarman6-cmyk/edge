"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import TradingCourseApp from "./TradingCourseApp";
import { User } from "@supabase/supabase-js";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Normal auth check (allows login to work)
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (!res.data.user) {
        router.push("/auth/login");
      } else {
        setUser(res.data.user);
      }
      setLoading(false);
    });
  }, []);

  // 🔥 Auto logout on refresh
  useEffect(() => {
    const handleLogoutOnRefresh = () => {
      supabase.auth.signOut();
    };

    // before page unload (refresh, close tab, etc.)
    window.addEventListener("beforeunload", handleLogoutOnRefresh);

    return () => window.removeEventListener("beforeunload", handleLogoutOnRefresh);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Checking access…
      </div>
    );
  }

  if (!user) return null;

  return <TradingCourseApp />;
}
