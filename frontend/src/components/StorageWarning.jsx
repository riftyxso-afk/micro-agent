import { useState, useEffect } from "react";
import { isPrivateBrowsing, isInAppBrowser, isStorageBlocked } from "@/lib/safeStorage";
import { AlertTriangle, X, Globe, Lock } from "lucide-react";

/**
 * StorageWarning — detects when localStorage is blocked (private browsing, in-app
 * browser, WebView) and shows a dismissible, user-friendly banner.
 *
 * The app will still function — safeStorage falls back to in-memory storage —
 * but the session won't persist across page refreshes, and features that depend
 * on persistent preferences won't work perfectly.
 */
export function StorageWarning() {
  const [dismissed, setDismissed] = useState(false);
  const [reason, setReason] = useState(null); // "private" | "inapp" | "unknown"

  useEffect(() => {
    if (isPrivateBrowsing()) {
      setReason("private");
    } else if (isInAppBrowser()) {
      setReason("inapp");
    } else if (isStorageBlocked) {
      setReason("unknown");
    }
  }, []);

  if (dismissed || !reason) return null;

  const messages = {
    private: {
      title: "Mode Private Browsing Terdeteksi",
      description:
        "Login mungkin tidak berfungsi penuh dalam mode private browsing. " +
        "Jika mengalami masalah, silakan gunakan mode browsing normal untuk pengalaman terbaik.",
    },
    inapp: {
      title: "In-App Browser Terdeteksi",
      description:
        "Beberapa fitur login mungkin terbatas saat menggunakan browser di dalam aplikasi. " +
        "Untuk hasil terbaik, buka link ini di Safari atau Chrome biasa.",
    },
    unknown: {
      title: "Penyimpanan Browser Terbatas",
      description:
        "Penyimpanan lokal browser tidak dapat diakses. Aplikasi akan tetap berjalan, " +
        "namun sesi login mungkin tidak bertahan setelah halaman di-refresh.",
    },
  };

  const msg = messages[reason];

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998]">
      <div className="mx-auto max-w-2xl px-3 pt-2">
        <div
          className="flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50 px-4 py-3 shadow-lg backdrop-blur-sm"
          role="alert"
        >
          {/* Icon */}
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100">
            {reason === "inapp" ? (
              <Globe size={16} strokeWidth={1.75} className="text-amber-600" />
            ) : (
              <Lock size={16} strokeWidth={1.75} className="text-amber-600" />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-amber-800">{msg.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-700/80">
              {msg.description}
            </p>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"
            aria-label="Tutup"
          >
            <X size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
