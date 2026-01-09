import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * 🔴 DEBUG VERSION
 * PURPOSE: Identify EXACTLY where the failure happens
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("🚀 FUNCTION HIT", new Date().toISOString());

  // CORS preflight
  if (req.method === "OPTIONS") {
    console.log("🟡 OPTIONS preflight");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🟢 Step 1: Reading Authorization header");
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", Boolean(authHeader));

    console.log("🟢 Step 2: Creating Supabase client");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    console.log("SUPABASE_URL exists:", Boolean(supabaseUrl));
    console.log("SUPABASE_ANON_KEY exists:", Boolean(anonKey));

    const supabase = createClient(
      supabaseUrl ?? "",
      anonKey ?? "",
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      }
    );

    console.log("🟢 Step 3: Fetching user");
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      console.error("❌ User fetch failed:", error);
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED_AT_getUser" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = data.user;
    console.log("✅ User authenticated:", user.id);

    console.log("🟢 Step 4: Parsing request body");
    const body = await req.json();
    console.log("Request body:", body);

    const plan_id = body.plan_id;
    const amountInput = Number(body.amount);

    console.log("Parsed plan_id:", plan_id);
    console.log("Parsed amount:", amountInput);

    if (!plan_id || !Number.isFinite(amountInput) || amountInput <= 0) {
      console.error("❌ Invalid input");
      return new Response(
        JSON.stringify({ error: "INVALID_INPUT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountPaise = Math.round(amountInput * 100);
    console.log("Amount in paise:", amountPaise);

    console.log("🟢 Step 5: Checking Razorpay env vars");
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    console.log("RAZORPAY_KEY_ID exists:", Boolean(RAZORPAY_KEY_ID));
    console.log("RAZORPAY_KEY_SECRET exists:", Boolean(RAZORPAY_KEY_SECRET));

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay env vars missing");
      return new Response(
        JSON.stringify({ error: "RAZORPAY_ENV_MISSING" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🟢 Step 6: Building Razorpay order payload");
    const orderData = {
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id,
        user_email: user.email ?? "",
      },
    };

    console.log("Order payload:", orderData);

    console.log("🟢 Step 7: Encoding Razorpay auth");
    const auth = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
    const encodedAuth = btoa(
      new TextEncoder().encode(auth).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    console.log("🟢 Step 8: Calling Razorpay API");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedAuth}`,
      },
      body: JSON.stringify(orderData),
    });

    console.log("Razorpay HTTP status:", response.status);

    const responseText = await response.text();
    console.log("Razorpay raw response:", responseText);

    if (!response.ok) {
      console.error("❌ Razorpay rejected request");
      return new Response(
        JSON.stringify({
          error: "RAZORPAY_ERROR",
          razorpay: responseText,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🟢 Step 9: Parsing Razorpay response");
    const order = JSON.parse(responseText);

    console.log("✅ Razorpay order created:", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        amount_paise: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("🔥 UNCAUGHT ERROR", err);
    return new Response(
      JSON.stringify({
        error: "UNCAUGHT_EXCEPTION",
        message: String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
