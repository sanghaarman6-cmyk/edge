'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import TradingCourseApp from '../TradingCourseApp';
import { User } from '@supabase/supabase-js';

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ INITIAL SESSION CHECK (ONCE)
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace('/auth/login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    init();
  }, [router]);

  // ✅ LISTEN FOR LOGOUT ONLY
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/auth/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Checking access…
      </div>
    );
  }

  // 🔐 HARD BLOCK (never render blank)
  if (!user) {
    router.replace('/auth/login');
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Redirecting…
      </div>
    );
  }

  // ✅ AUTHENTICATED
  return <TradingCourseApp />;
}
