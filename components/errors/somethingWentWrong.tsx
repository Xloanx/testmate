"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardCopy } from "lucide-react";
// adjust path to where your Logo lives
import Logo from "../logo";

export default function SomethingWentWrong({
  title = "Something went wrong",
  subtitle = "Please try again later.",
  errorId,          // optional: a correlation ID you pass in
  details,          // optional: error details or stack (string)
  onRetry,          // optional: callback (Next.js error boundary gives you reset)
  supportHref = "/support", // or "mailto:support@example.com"
}) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const retry = () => (onRetry ? onRetry() : router.refresh());

  const copyId = async () => {
    if (!errorId) return;
    try {
      await navigator.clipboard.writeText(errorId);
    } catch {}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <Logo />
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="mb-6"
        aria-hidden="true"
      >
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-2xl font-bold"
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="text-gray-500 max-w-md mt-2"
        aria-live="polite"
      >
        {subtitle}
      </motion.p>

      {/* Error Id (optional) */}
      {errorId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mt-3 flex items-center gap-2 text-xs text-gray-500"
        >
          <span className="font-mono">Error ID: {errorId}</span>
          <button
            onClick={copyId}
            className="inline-flex items-center gap-1 rounded px-2 py-1 bg-gray-100 hover:bg-gray-200"
            aria-label="Copy error ID"
            title="Copy error ID"
          >
            <ClipboardCopy className="w-4 h-4" />
            Copy
          </button>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={retry}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow"
        >
          Try Again
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/")}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
        >
          Go Home
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(supportHref)}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          Contact Support
        </motion.button>

        {details && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDetails((s) => !s)}
            className="px-5 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium"
          >
            {showDetails ? "Hide details" : "View details"}
          </motion.button>
        )}
      </div>

      {/* Collapsible details */}
      {details && showDetails && (
        <motion.pre
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 max-w-2xl w-full text-left overflow-auto rounded-xl bg-gray-50 p-4 text-sm text-gray-700 border border-gray-200"
        >
          {typeof details === "string" ? details : JSON.stringify(details, null, 2)}
        </motion.pre>
      )}
    </div>
  );
}
