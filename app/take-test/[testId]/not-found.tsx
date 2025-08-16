"use client";

import { useRouter } from "next/navigation";
import { MdOutlineSearchOff } from "react-icons/md";
import { motion } from "framer-motion";
import Logo from "@/components/logo";
export default function TestNotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      
      {/* App Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Logo />
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="mb-6"
      >
        <MdOutlineSearchOff className="text-6xl text-red-500" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold"
      >
        Test Not Found
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 max-w-md mt-2"
      >
        We couldn’t find the test you’re looking for. It might have been deleted, 
        moved, or the link could be broken.
      </motion.p>

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
        >
          Go Back
        </motion.button>

        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/tests/create")}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Create New Test
        </motion.button> */}
      </div>
    </div>
  );
}
