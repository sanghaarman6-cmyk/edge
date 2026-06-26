'use client';

import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 🔥 Call your backend route instead of Supabase directly
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    // 🔥 Set Supabase session manually
    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-700 space-y-4">

        <div className="p-3 bg-yellow-500/10 border border-yellow-600/40 text-yellow-400 rounded-md text-sm">
          ⚠️ For the best experience, please use this service on a desktop or laptop computer.
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-zinc-600 py-3 rounded-lg font-semibold hover:bg-zinc-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
