return (
  <div className="flex items-center justify-center min-h-screen bg-black text-white">
    <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md border border-zinc-700">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Admin – Create Student Login
      </h1>

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
