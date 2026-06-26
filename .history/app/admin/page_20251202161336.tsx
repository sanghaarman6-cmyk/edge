'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "12345"; // set your real PIN

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      localStorage.setItem("adminAccess", "true");
      router.push("/admin/panel");
    } else {
      setError("Incorrect PIN.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form 
        onSubmit={handleSubmit} 
        className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm border border-zinc-700"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Enter Admin PIN</h1>

        <input
          className="w-full p-3 rounded bg-zinc-800 border border-zinc-700 mb-4"
          placeholder="Admin PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button className="w-full bg-zinc-600 py-3 rounded-lg font-semibold hover:bg-zinc-700">
          Enter
        </button>

        {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
      </form>
    </div>
  );
}
