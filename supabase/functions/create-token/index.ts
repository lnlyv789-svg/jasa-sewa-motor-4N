// supabase/functions/create-token/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;
    const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:5173";

    if (!MIDTRANS_SERVER_KEY) {
      throw new Error("MIDTRANS_SERVER_KEY belum di-set");
    }

    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id wajib dikirim" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, motors(name)")
      .eq("order_id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order tidak ditemukan", detail: orderError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==== Tentukan stage & gross_amount ====
    const isSettlement = order.payment_status === "partial_paid";
    let grossAmount;
    let midtransOrderId;

    if (isSettlement) {
      grossAmount = order.amount_due;
      midtransOrderId = `${order.order_id}-S`; // suffix pelunasan
    } else {
      grossAmount = order.payment_type === "dp"
        ? Math.round(order.total_price * 0.5)
        : order.total_price;
      midtransOrderId = order.order_id;
    }

    const itemName = isSettlement
      ? `Pelunasan Sewa ${order.motors?.name || "Motor"}`
      : `Sewa ${order.motors?.name || "Motor"} (${order.duration_days} hari)`;

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      item_details: [
        {
          id: order.motor_id,
          price: grossAmount,
          quantity: 1,
          name: itemName,
        },
      ],
      callbacks: {
        finish: `${SITE_URL}/invoice/${order.order_id}`,
        error: `${SITE_URL}/checkout/${order.order_id}`,
        pending: `${SITE_URL}/riwayat/${order.id}`,
      },
    };

    const midtransBaseUrl = MIDTRANS_IS_PRODUCTION
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";

    const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

    const midtransRes = await fetch(`${midtransBaseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans error:", midtransData);
      return new Response(
        JSON.stringify({ error: "Gagal generate SNAP_TOKEN", detail: midtransData }),
        { status: midtransRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("orders")
      .update({ snap_token: midtransData.token })
      .eq("order_id", order_id);

    return new Response(
      JSON.stringify({
        success: true,
        token: midtransData.token,
        redirect_url: midtransData.redirect_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Terjadi kesalahan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});