import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, onAuthChange, getSession, signIn, signUp, signOut } from "@/lib/supabase";

const GUEST_LIMIT = 10;
const GUEST_COUNT_KEY = "ma_guest_prompts";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestCount, setGuestCount] = useState(() => {
    try { return parseInt(localStorage.getItem(GUEST_COUNT_KEY) || "0", 10); }
    catch { return 0; }
  });

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setUser(s?.user || null);
      setLoading(false);
    });
    const unsub = onAuthChange((u) => {
      setUser(u);
      getSession().then(setSession);
      // Reset guest count on login
      if (u) {
        localStorage.removeItem(GUEST_COUNT_KEY);
        setGuestCount(0);
      }
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const data = await signIn(email, password);
    setUser(data.user);
    setSession(data.session);
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
  };

  // Increment + check. Call once per user-initiated prompt.
  const incrementGuestCount = useCallback(() => {
    if (user) return true;
    const next = guestCount + 1;
    setGuestCount(next);
    try { localStorage.setItem(GUEST_COUNT_KEY, String(next)); } catch {}
    return next <= GUEST_LIMIT;
  }, [user, guestCount]);

  // Check-only, no increment. Use for auto-triggered sends (seed from navigation).
  const checkGuestAllowed = useCallback(() => {
    if (user) return true;
    return guestCount < GUEST_LIMIT;
  }, [user, guestCount]);

  const guestRemaining = user ? Infinity : Math.max(0, GUEST_LIMIT - guestCount);
  const isGuestLimitReached = !user && guestCount >= GUEST_LIMIT;

  return (
    <AuthContext.Provider value={{
      user, session, loading,
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
