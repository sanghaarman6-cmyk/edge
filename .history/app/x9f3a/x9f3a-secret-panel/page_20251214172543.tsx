'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();

  // -------- existing user creation state --------
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');

  // -------- announcement state --------
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementStatus, setAnnouncementStatus] = useState('');
  const [variant, setVariant] = useState<'neutral' | 'green' | 'yellow' | 'red'>('neutral');

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

  async function postAnnouncement() {
    setAnnouncementStatus('Posting...');

    if (!announcementMessage.trim()) {
      setAnnouncementStatus('❌ Message is required');
      return;
    }

    const res = await fetch('/api/admin/announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: announcementTitle,
        message: announcementMessage,
        variant, // ✅ NEW
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAnnouncementStatus('❌ ' + (data.error || 'Failed to post'));
    } else {
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setVariant('neutral');
      setAnnouncementStatus('✅ Announcement posted');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-700 space-y-8">

        {/* CREATE USER */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Create Student</h2>

          <input
            className="bg-zinc-800 border border-zinc-700 p-3 rounded w-full"
            placeholder="Student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="bg-zinc-800 border border-zinc-700 p-3 rounded w-full"
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

        {/* DIVIDER */}
        <div className="border-t border-zinc-700 pt-6 space-y-4">

          {/* ANNOUNCEMENTS */}
          <h2 className="text-lg font-semibold">Admin Announcement</h2>

          <input
            className="bg-zinc-800 border border-zinc-700 p-3 rounded w-full"
            placeholder="Optional title"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />

          <textarea
            className="bg-zinc-800 border border-zinc-700 p-3 rounded w-full"
            placeholder="Announcement message (shown on student home page)"
            rows={4}
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
          />

          {/* ✅ VARIANT SELECTOR */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Announcement type</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded text-sm"
            >
              <option value="neutral">Neutral / Info</option>
              <option value="green">Positive / Update</option>
              <option value="yellow">Attention</option>
              <option value="red">Critical / Warning</option>
            </select>
          </div>

          <button
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-500"
            onClick={postAnnouncement}
          >
            Post Announcement
          </button>

          <p className="text-sm text-zinc-400">{announcementStatus}</p>
        </div>

      </div>
    </div>
  );
}
