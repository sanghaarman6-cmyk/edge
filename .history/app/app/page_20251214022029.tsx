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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.replace('/auth/login');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Checking access…
      </div>
    );
  }

  if (!user) return null;

  return <TradingCourseApp />;
}
