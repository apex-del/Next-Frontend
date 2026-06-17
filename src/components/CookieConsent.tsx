"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
      document.cookie = `cookie_consent=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 bottom-16 md:bottom-4 z-50 px-3 flex justify-center pointer-events-none"
        >
          <div className="relative w-full max-w-2xl pointer-events-auto rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Cookie className="h-6 w-6 text-primary shrink-0" />
            <p className="text-xs sm:text-sm text-muted-foreground flex-1">
              We use cookies and your session to keep you signed in, remember your
              preferences, and improve your experience. You can change this any time.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => decide("declined")}
                className="rounded-lg px-3 py-2 text-xs sm:text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => decide("accepted")}
                className="rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Accept
              </button>
            </div>
            <button
              onClick={() => decide("declined")}
              className="absolute top-2 right-2 sm:hidden p-1 text-muted-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
