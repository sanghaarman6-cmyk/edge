'use client';

import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [message, setMessage] = useState("");

  async function createUser() {
    setMessage("Creating...");
    
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (data.error) setMessage("❌ " + data.error);
    else setMessage("✅ User created!");
  }

  return (
    <div className="p-10 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin – Create Student Login</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          className="bg-zinc-900 border border-zinc-700 p-3 rounded"
          placeholder="Student email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="bg-zinc-900 border border-zinc-700 p-3 rounded"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          className="bg-blue-600 px-4 py-2 rounded"
          onClick={createUser}
        >
          Create User
        </button>

        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
