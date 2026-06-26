"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center text-white bg-black">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      <input
        className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
      >
        Login
      </button>

      {error && <p className="text-red-400 mt-3">{error}</p>}
    </div>
  );
}
