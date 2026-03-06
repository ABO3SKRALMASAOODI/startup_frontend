import React from "react";
import { motion } from "framer-motion";

const RobotBubble = () => {
  return (
    <motion.div
      className="fixed bottom-6 z-50 cursor-pointer flex items-center gap-3 sm:left-1/2 sm:transform sm:-translate-x-1/2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="relative w-20 h-20 rounded-full bg-[#1a0000] shadow-[0_0_20px_#ff1a1a] hover:scale-110 transition">
        <img
          src="/robot-head.png" // ✅ Make sure this image exists in your public folder
          alt="Robot Chat"
          className="w-full h-full rounded-full p-2"
        />
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full animate-ping" />
      </div>
    </motion.div>
  );
};

export default RobotBubble;
