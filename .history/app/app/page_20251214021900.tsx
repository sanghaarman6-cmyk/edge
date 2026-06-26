'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import TradingCourseApp from '../TradingCourseApp';
import { User } from '@supabase/supabase-js';
// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/training');
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/auth/login'); // 🚫 not logged in → login
      } else {
        setUser(data.user); // ✅ logged in
      }
      setLoading(false);
    });
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
