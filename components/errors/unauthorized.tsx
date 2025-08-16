"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <Lock className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">401 – Unauthorized</h1>
      <p className="text-gray-600 mb-6">
        You need to be logged in to view this page.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
      >
        Go to Login
      </button>
    </div>
  );
}
