'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabaseClient';
import TradingCourseApp from "./TradingCourseApp";
import { User } from "@supabase/supabase-js";

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login');
      }
    });
  }, [router]);

  return (
    // your TradingCourseApp render here
  );
}



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
