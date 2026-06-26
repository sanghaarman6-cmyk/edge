'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const allowed = localStorage.getItem('adminAccess');
    if (allowed !== 'true') {
      router.push('/admin');
    }
  }, [router]);

  async function createUser() {
    setMessage('Creating...');

    if (!/^[\x00-\x7F]*$/.test(pass)) {
      setMessage('❌ Password cannot contain emoji or special Unicode characters.');
      return;
    }

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (data.error) setMessage('❌ ' + data.error);
    else setMessage('✅ User created!');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-700">

        <div className="flex flex-col gap-4">
          <input
            className="bg-zinc-800 border border-zinc-700 p-3 rounded"
            placeholder="Student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="bg-zinc-800 border border-zinc-700 p-3 rounded"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            className="w-full bg-zinc-600 py-3 rounded-lg font-semibold hover:bg-zinc-700"
            onClick={createUser}
          >
            Create User
          </button>

          <p className="text-sm text-zinc-400">{message}</p>
        </div>
      </div>
    </div>
  );
}
