// supabase/functions/webhook-midtrans/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;

    const notification = await req.json();
    console.log("Webhook received:", JSON.stringify(notification, null, 2));

    let {
      order_id,
      transaction_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      status_code,
      signature_key,
    } = notification;

    if (!order_id) {
      return new Response("No order_id", { status: 400 });
    }

    // ==== Verifikasi signature ====
    const rawSignature = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawSignature);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedSignature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedSignature !== signature_key) {
      console.error("Signature mismatch!");
      return new Response("Invalid signature", { status: 401 });
    }

    // ==== Detect settlement (order_id ends with -S) ====
    let originalOrderId = order_id;
    let isSettlement = false;
    if (originalOrderId.endsWith("-S")) {
      originalOrderId = originalOrderId.slice(0, -2);
      isSettlement = true;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", originalOrderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", originalOrderId);
      return new Response("Order not found", { status: 404 });
    }

    // ==== Simpan ke payments ====
    const paymentStage = isSettlement ? "settlement" : "dp";

    await supabase.from("payments").insert([
      {
        order_id: originalOrderId,
        transaction_id: transaction_id,
        payment_stage: paymentStage,
        payment_type: payment_type,
        gross_amount: parseInt(gross_amount),
        transaction_status: transaction_status,
        fraud_status: fraud_status,
        raw_response: notification,
      },
    ]);

    // ==== Update orders ====
    let orderUpdates = {};

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        const paidAmount = parseInt(gross_amount);

        if (isSettlement) {
          // Pelunasan sisa → LUNAS
          orderUpdates = {
            payment_status: "paid",
            amount_paid: order.total_price,
            amount_due: 0,
          };
        } else if (order.payment_type === "full") {
          // Full payment pertama
          orderUpdates = {
            payment_status: "paid",
            rental_status: "menunggu_verifikasi",
            amount_paid: order.total_price,
            amount_due: 0,
          };
        } else {
          // DP pertama
          orderUpdates = {
            payment_status: "partial_paid",
            rental_status: "menunggu_verifikasi",
            amount_paid: paidAmount,
            amount_due: order.total_price - paidAmount,
          };
        }
      }
    } else if (transaction_status === "pending") {
      orderUpdates = { payment_status: "unpaid" };
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      orderUpdates = { payment_status: "failed" };
    }

    if (Object.keys(orderUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("orders")
        .update(orderUpdates)
        .eq("order_id", originalOrderId);

      if (updateError) {
        console.error("Update error:", updateError);
        return new Response("Update failed", { status: 500 });
      }
      console.log("Order updated:", originalOrderId, orderUpdates);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});