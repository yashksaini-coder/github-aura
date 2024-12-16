import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingMessages = () => {
  const messages = [
    "Calculating your aura...",
    "Checking your PRs...",
    "Looking at what you cooked...",
    "Analyzing your code...",
    "Reading your commits...",
    "Measuring your impact...",
    "Scanning your projects...",
    "Counting your stars...",
    "Evaluating your contributions...",
    "Processing your GitHub magic...",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 pt-4 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="font-bold text-white text-center"
        >
          {messages[currentIndex]}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
};
