'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';
import TradingCourseApp from './TradingCourseApp';

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    check();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-black">
        Checking access…
      </div>
    );
  }

  return <TradingCourseApp user={user} />;
}
