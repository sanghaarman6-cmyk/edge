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

  return loading ? (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      Checking access…
    </div>
  ) : user ? (
    <TradingCourseApp />
  ) : null;
}
