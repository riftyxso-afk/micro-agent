import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, onAuthChange, getSession, signIn, signUp, signOut } from "@/lib/supabase";
import { API_BASE_URL } from "@/lib/chatApi";

const GUEST_LIMIT = 10;
const GUEST_COUNT_KEY = "ma_guest_prompts";

const AuthContext = createContext(null);

async function checkOnboarded(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/onboarding/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    return d.is_onboarded === true;
  } catch { return true; } // fail open — don't block user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(true); // assume true until verified
  const [guestCount, setGuestCount] = useState(() => {
    try { return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || "0", 10); }
    catch { return 0; }
  });

  useEffect(() => {
    getSession().then(async (s) => {
      setSession(s);
      setUser(s?.user || null);
      if (s?.access_token) {
        const onboarded = await checkOnboarded(s.access_token);
        setIsOnboarded(onboarded);
      }
      setLoading(false); // Only after onboarding check completes
    });
    const unsub = onAuthChange((u) => {
      setUser(u);
      if (u) {
        // NOTE: Do NOT set loading=true here. The login() function already
        // handles session + onboarding check. Setting loading here causes a
        // race condition — two parallel async flows fight to set state,
        // and the loading overlay blanks the page on mobile.
        getSession().then(async (s) => {
          setSession(s);
          if (s?.access_token) {
            const onboarded = await checkOnboarded(s.access_token);
            setIsOnboarded(onboarded);
          }
        });
        localStorage.removeItem(GUEST_COUNT_KEY);
        setGuestCount(0);
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const data = await signIn(email, password);
    setUser(data.user);
    setSession(data.session);
    // NOTE: onAuthChange callback already handles checkOnboarded() —
    // no need to duplicate the API call here.
    return data;
  };

  const register = async (email, password) => {
    const data = await signUp(email, password);
    return data;
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setIsOnboarded(true);
  };

  const incrementGuestCount = useCallback(() => {
    if (user) return true;
    const next = guestCount + 1;
    setGuestCount(next);
    try { localStorage.setItem(GUEST_COUNT_KEY, String(next)); } catch {}
    return next <= GUEST_LIMIT;
  }, [user, guestCount]);

  const checkGuestAllowed = useCallback(() => {
    if (user) return true;
    return guestCount < GUEST_LIMIT;
  }, [user, guestCount]);

  const guestRemaining = user ? Infinity : Math.max(0, GUEST_LIMIT - guestCount);
  const isGuestLimitReached = !user && guestCount >= GUEST_LIMIT;

  return (
    <AuthContext.Provider value={{
      user, session, loading, isOnboarded, setIsOnboarded,
      login, register, logout,
      guestCount, guestRemaining, isGuestLimitReached,
      incrementGuestCount, checkGuestAllowed, GUEST_LIMIT,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
