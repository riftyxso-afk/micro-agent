import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/lib/chatApi";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

const PLAN_FEATURES = {
  free: {
    models: ["deepseek-v4-flash", "glm-5"],
    webSearch: true,
    dailyWebSearch: 5,
    fileAnalysis: false,
    autoMode: false,
    historySync: false,
    credits: 50,
  },
  pro: {
    models: "all",
    webSearch: true,
    dailyWebSearch: Infinity,
    fileAnalysis: true,
    autoMode: true,
    historySync: true,
    credits: 2000,
  },
  ultra: {
    models: "all",
    webSearch: true,
    dailyWebSearch: Infinity,
    fileAnalysis: true,
    autoMode: true,
    historySync: true,
    credits: 10000,
    prioritySupport: true,
    earlyAccess: true,
  },
};

export function useSubscription() {
  const { user, session } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({ plan: "free", status: "active", credits: PLAN_FEATURES.free.credits });
      setLoading(false);
      return;
    }
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/user/subscription`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSubscription(data.subscription || { plan: "free", status: "active" });
    } catch {
      setSubscription({ plan: "free", status: "active", credits: PLAN_FEATURES.free.credits });
    }
    setLoading(false);
  }, [user, session]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Realtime listener on Supabase subscriptions table
  useEffect(() => {
    if (!supabase || !user) return;
    const channel = supabase
      .channel("subscription-changes")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "subscriptions",
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchSubscription(); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, fetchSubscription]);

  const plan = subscription?.plan || "free";
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  const isPro = plan === "pro" || plan === "ultra";
  const isUltra = plan === "ultra";
  const isActive = subscription?.status === "active";

  return {
    subscription,
    plan,
    features,
    isPro,
    isUltra,
    isActive,
    loading,
    refresh: fetchSubscription,
    PLAN_FEATURES,
  };
}
