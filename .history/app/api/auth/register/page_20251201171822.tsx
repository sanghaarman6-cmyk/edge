"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const register = async () => {
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setError(error.message);
    else setSuccess("User created successfully.");
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center text-white bg-black">
      <h2 className="text-xl font-semibold mb-4">Create Student Account</h2>

      <input
        className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 mb-3"
        placeholder="Student Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="bg-zinc-900 border border-zinc-700 rounded px-4 py-2 mb-3"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded"
      >
        Create Account
      </button>

      {error && <p className="text-red-400 mt-3">{error}</p>}
      {success && <p className="text-green-400 mt-3">{success}</p>}
    </div>
  );
}
