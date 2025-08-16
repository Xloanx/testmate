// components/errors/Forbidden.js
"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">403 – Forbidden</h1>
      <p className="text-gray-600 mb-6">
        You don’t have permission to view this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg shadow"
        >
          Go Back
        </button>
        <button
          onClick={() => router.push("/support")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}
