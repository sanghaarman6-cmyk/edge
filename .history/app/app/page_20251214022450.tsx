'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import TradingCourseApp from '../TradingCourseApp';
import { Session } from '@supabase/supabase-js';

export default function AppPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Initial session check (CRITICAL)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 🔹 Listen for future auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔹 Redirect ONLY after loading finishes
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth/login');
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Checking access…
      </div>
    );
  }

  if (!session) return null;

  return <TradingCourseApp />;
}
