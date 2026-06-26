'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import TradingCourseApp from '../TradingCourseApp';
import type { Session } from '@supabase/supabase-js';

export default function AppPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session ?? null);
      setLoading(false);

      // If no session, send to login
      if (!data.session) {
        router.replace('/auth/login');
      }
    })();

    // Keep state updated if user signs out in another tab etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) router.replace('/auth/login');
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

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
