import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "monthly" | "quarterly" | "yearly";
  status: string;
  started_at: string;
  expires_at: string | null;
  last_payment_date: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error);
      }
      
      if (data) {
        setSubscription(data as Subscription);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription?.plan && subscription.plan !== "free";
  
  const isExpired = subscription?.expires_at 
    ? new Date(subscription.expires_at) < new Date()
    : false;

  const hasActiveSubscription = isPremium && !isExpired;

  return {
    subscription,
    loading,
    isPremium,
    isExpired,
    hasActiveSubscription,
    refetch: fetchSubscription,
  };
};