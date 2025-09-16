// app/login/page.tsx

"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false, // Do not redirect automatically, we'll handle it
      email,
      password,
    });

    if (result?.ok) {
      // On success, redirect to the main buyers page
      router.push("/buyers");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="mb-4 text-2xl font-bold text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-sm text-center text-red-500">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
          <div className="mt-4 text-sm text-center text-gray-500">
            <p>Use demo credentials:</p>
            <p><strong>Email:</strong> user@example.com</p>
            <p><strong>Password:</strong> password</p>
          </div>
        </form>
      </div>
    </div>
  );
}