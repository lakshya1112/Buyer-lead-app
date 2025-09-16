// app/buyers/components/LogoutButton.tsx
"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
  );
}