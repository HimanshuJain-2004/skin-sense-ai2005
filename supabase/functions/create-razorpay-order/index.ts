import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderRequest {
  plan_id: string;
  amount: number | string; // rupees (can be decimal) recommended
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract Authorization header safely
    const authHeader = req.headers.get("Authorization") ?? "";

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          // only include a header if present; an empty object is safe
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: OrderRequest = await req.json();
    const plan_id = body.plan_id;
    const amountInput = Number(body.amount);

    // Accept rupee amounts (allow decimal up to 2 places) and convert to paise
    if (!plan_id || !Number.isFinite(amountInput) || amountInput <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid plan_id or amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert rupees to paise (integer) and ensure > 0
    const amountPaise = Math.round(amountInput * 100);
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount after conversion to paise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Razorpay order
    const orderData = {
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: plan_id,
        user_email: user.email ?? "",
      },
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Razorpay error:", errorData);

      return new Response(
        JSON.stringify({
          error: "Razorpay order creation failed",
          razorpay: errorData,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const order = await response.json();

    // order.amount is in paise — return both for clarity
    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount_paise: order.amount,
        amount_rupees: order.amount / 100,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
      }),
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
