/**
 * Safe storage utilities — protect against "SecurityError: The operation is insecure"
 * thrown by Safari/iOS mobile in Private Browsing mode or when storage is blocked
 * (in-app browsers, WebViews, etc.).
 *
 * Every direct localStorage/sessionStorage call in the app should go through
 * these helpers instead of calling the raw API.
 */

// ── In-memory fallback storage when localStorage/sessionStorage is blocked ────
const memoryStore = new Map();

// ── localStorage safe wrappers ────────────────────────────────────────────────

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
}

export function safeClear() {
  try {
    localStorage.clear();
  } catch {
    memoryStore.clear();
  }
}

// ── sessionStorage safe wrappers ──────────────────────────────────────────────

export function safeSessionGetItem(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return memoryStore.get(`_session_${key}`) ?? null;
  }
}

export function safeSessionSetItem(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    memoryStore.set(`_session_${key}`, value);
  }
}

export function safeSessionRemoveItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    memoryStore.delete(`_session_${key}`);
  }
}

// ── Supabase-compatible storage adapter ───────────────────────────────────────
// Pass this as `auth: { storage: supabaseSafeStorage }` to createClient().

export const supabaseSafeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};

// ── Availability detection ────────────────────────────────────────────────────

/**
 * Returns true if localStorage is fully accessible (read + write + delete).
 * Caches the result after first check.
 */
let _storageAvailable = null;

export function isStorageAvailable() {
  if (_storageAvailable !== null) return _storageAvailable;
  const key = `__ma_test_${Date.now()}`;
  try {
    localStorage.setItem(key, '1');
    const val = localStorage.getItem(key);
    localStorage.removeItem(key);
    _storageAvailable = val === '1';
    return _storageAvailable;
  } catch {
    _storageAvailable = false;
    return false;
  }
}

/**
 * Returns true if private/incognito browsing is likely active.
 * Detection heuristic: localStorage exists but throws on access.
 * Note: This is a best-effort detection and may not be 100% reliable.
 */
let _privateBrowsing = null;

export function isPrivateBrowsing() {
  if (_privateBrowsing !== null) return _privateBrowsing;

  // If storage is fully available, definitely not private browsing
  if (isStorageAvailable()) {
    _privateBrowsing = false;
    return false;
  }

  // Check if localStorage exists as an object but throws on methods
  // (Safari private browsing pattern)
  try {
    const testKey = `__ma_private_test_${Date.now()}`;
    localStorage.setItem(testKey, '1'); // This will throw if private browsing
    localStorage.removeItem(testKey);
    _privateBrowsing = false;
  } catch {
    // Check if it's because localStorage is blocked entirely vs. private mode
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      _privateBrowsing = true; // localStorage exists but throws — private browsing
    } else {
      _privateBrowsing = false; // localStorage doesn't exist at all — very old browser
    }
  }

  return _privateBrowsing;
}

/**
 * Check if we're running inside an in-app browser / WebView
 * (Instagram, Facebook, TikTok, etc.) which often block storage.
 */
export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = (navigator.userAgent || '').toLowerCase();
  return (
    ua.includes('fbav') ||
    ua.includes('fban') ||
    ua.includes('instagram') ||
    ua.includes('tiktok') ||
    ua.includes('linkedin') ||
    ua.includes('wv') ||
    (ua.includes('twitter') && ua.includes('safari')) || // X/Twitter in-app
    (ua.includes('snapchat') && ua.includes('safari'))
  );
}

// ── Module-level checks (runs once on import) ─────────────────────────────────
// This fires when the module is first imported, catching storage issues early.

const _storageWorking = (() => {
  try {
    const k = `__ma_boot_${Date.now()}`;
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

export const isStorageBlocked = !_storageWorking;

// ── Convenience hook-like helpers for React state initialization ──────────────

/**
 * Use for initializing React state from localStorage with a safe default.
 * Example: const [count, setCount] = useState(() => safeInitStorage('key', 0));
 */
export function safeInitStorage(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Same as safeInitStorage but parses JSON.
 */
export function safeInitStorageJSON(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Parse a numeric value from storage safely.
 */
export function safeInitStorageInt(key, defaultValue = 0) {
  try {
    return parseInt(localStorage.getItem(key) || `${defaultValue}`, 10);
  } catch {
    return defaultValue;
  }
}
