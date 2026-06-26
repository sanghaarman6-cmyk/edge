'use client';

import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useRouter } from 'next/navigation';

type LoginResponse =
  | { user: any; session: any }
  | { error: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as LoginResponse;

    if (!res.ok || 'error' in data) {
      setError('error' in data ? data.error : 'Login failed');
      return;
    }

    // ✅ THIS IS THE KEY: create the browser session
    if (data.session) {
      const { error: sessionErr } = await supabase.auth.setSession(data.session);
      if (sessionErr) {
        setError(sessionErr.message);
        return;
      }
    } else {
      setError('No session returned from server.');
      return;
    }

    // ✅ use replace so you don't go back to login on back button
    router.replace('/app');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-700 space-y-4">
        <div className="p-3 bg-yellow-500/10 border border-yellow-600/40 text-yellow-400 rounded-md text-sm">
          ⚠️ For the best experience, please use this service on a desktop, iPad or laptop computer.
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-zinc-600 py-3 rounded-lg font-semibold hover:bg-zinc-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
