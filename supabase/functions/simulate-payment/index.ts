// supabase/functions/simulate-payment/index.ts
// Edge Function khusus DEMO: mensimulasikan pembayaran sukses
// JANGAN dipakai di production!

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
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id wajib" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ambil order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order tidak ditemukan" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tentukan update status (simulasi sukses)
    let updates = {};
    if (order.payment_type === "full") {
      updates = {
        payment_status: "paid",
        rental_status: "menunggu_verifikasi",
        amount_paid: order.total_price,
        amount_due: 0,
      };
    } else {
      // DP
      updates = {
        payment_status: "partial_paid",
        rental_status: "menunggu_verifikasi",
        amount_paid: Math.round(order.total_price * 0.5),
        amount_due: order.total_price - Math.round(order.total_price * 0.5),
      };
    }

    // Update order
    await supabase.from("orders").update(updates).eq("order_id", order_id);

    // Simpan record di payments (opsional)
    await supabase.from("payments").insert([
      {
        order_id: order_id,
        transaction_id: `SIMULASI-${Date.now()}`,
        payment_stage: order.payment_type === "full" ? "settlement" : "dp",
        payment_type: "simulation",
        gross_amount: updates.amount_paid,
        transaction_status: "settlement",
        fraud_status: "accept",
        raw_response: { simulated: true, timestamp: new Date().toISOString() },
      },
    ]);

    return new Response(JSON.stringify({ success: true, message: "Pembayaran disimulasikan!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});