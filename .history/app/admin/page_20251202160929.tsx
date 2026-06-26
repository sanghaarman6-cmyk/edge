'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");

  const checkPin = () => {
    if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      router.push("/admin/panel/page.tsx");
    } else {
      alert("Invalid PIN");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="p-6 bg-zinc-900 rounded-xl w-full max-w-sm">
        <h2 className="text-xl mb-4 font-semibold">Admin Verification</h2>

        <input
          type="password"
          className="w-full p-3 rounded bg-zinc-800 border border-zinc-700"
          placeholder="Enter admin PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button
          onClick={checkPin}
          className="w-full bg-red-600 py-3 mt-3 rounded-lg font-semibold hover:bg-red-700"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
