import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: string;
}

const getPlanDuration = (planId: string): { months: number; plan: string } => {
  switch (planId) {
    case "monthly":
      return { months: 1, plan: "monthly" };
    case "quarterly":
      return { months: 3, plan: "quarterly" };
    case "yearly":
      return { months: 12, plan: "yearly" };
    default:
      return { months: 1, plan: "monthly" };
  }
};

// HMAC SHA256 using Web Crypto API
async function createHmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id }: VerifyRequest = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature using Web Crypto API
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createHmacSha256(RAZORPAY_KEY_SECRET, body);

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch. Expected:", expectedSignature, "Got:", razorpay_signature);
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment signature verified successfully");

    // Payment verified, update subscription using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { months, plan } = getPlanDuration(plan_id);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000);

    // Check if subscription exists
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let updateError;
    
    if (existingSub) {
      // Update existing subscription
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          plan: plan,
          status: "active",
          expires_at: expiresAt.toISOString(),
          last_payment_date: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      updateError = error;
    } else {
      // Create new subscription
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: plan,
          status: "active",
          expires_at: expiresAt.toISOString(),
          last_payment_date: new Date().toISOString(),
        });
      updateError = error;
    }

    if (updateError) {
      console.error("Failed to update subscription:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Subscription updated successfully for user:", user.id);

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and subscription updated" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
