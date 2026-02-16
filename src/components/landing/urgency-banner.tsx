"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function UrgencyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("landing.urgencyBanner");

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative overflow-hidden"
        >
          {/* Layered background: pulsing rose glow + scan-lines */}
          <div className="relative scan-lines">
            {/* Animated pulsing gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-rose-600/40 via-rose-500/60 to-rose-600/40"
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Subtle horizontal shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            {/* Top and bottom edge glow lines */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />

            {/* Content */}
            <div className="relative z-10 container mx-auto flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium text-white">
              {/* Animated alert icon with pulse ring */}
              <motion.div
                className="relative shrink-0"
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AlertTriangle className="h-4 w-4 text-rose-200 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                {/* Pulse ring behind icon */}
                <motion.div
                  className="absolute inset-0 -m-1 rounded-full border border-rose-400/60"
                  animate={{
                    scale: [1, 2],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </motion.div>

              <span className="text-center tracking-wide">
                <span className="hidden sm:inline">{t("text")}</span>
                <span className="sm:hidden">{t("textShort")}</span>
              </span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded p-1.5 text-rose-200/80 hover:text-white hover:bg-rose-500/30 transition-all duration-200"
            aria-label="close"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
