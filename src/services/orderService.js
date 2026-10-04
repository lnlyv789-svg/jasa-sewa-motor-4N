// src/services/orderService.js
import { supabase } from "../lib/supabase";

const mapOrderFromDB = (order) => {
  if (!order) return null;
  return {
    id: order.id,
    orderId: order.order_id,
    invoiceNumber: order.invoice_number,
    userId: order.user_id,
    motorId: order.motor_id,
    motorName: order.motors?.name || null,
    motorImage: order.motors?.image_url || null,
    startDate: order.start_date,
    durationDays: order.duration_days,
    totalPrice: order.total_price,
    paymentType: order.payment_type,
    amountPaid: order.amount_paid,
    amountDue: order.amount_due,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    pickupMethod: order.pickup_method,
    deliveryAddress: order.delivery_address,
    identityType: order.identity_type,
    identityHeld: order.identity_held,
    paymentStatus: order.payment_status,
    rentalStatus: order.rental_status,
    cancelledAt: order.cancelled_at,
    refundAmount: order.refund_amount,
    refundStatus: order.refund_status,
    refundNote: order.refund_note,
    refundTransferredAt: order.refund_transferred_at,
    refundBankName: order.refund_bank_name,
    refundBankAccount: order.refund_bank_account,
    snapToken: order.snap_token,
    createdAt: order.created_at,
  };
};

const mapOrderToDB = (order) => {
  return {
    order_id: order.orderId,
    invoice_number: order.invoiceNumber,
    user_id: order.userId,
    motor_id: order.motorId,
    start_date: order.startDate,
    duration_days: order.durationDays,
    total_price: order.totalPrice,
    payment_type: order.paymentType,
    amount_paid: order.amountPaid || 0,
    amount_due: order.amountDue || 0,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    pickup_method: order.pickupMethod,
    delivery_address: order.deliveryAddress || null,
    identity_type: order.identityType,
    identity_held: order.identityHeld || false,
    payment_status: order.paymentStatus || "unpaid",
    rental_status: order.rentalStatus || "pending",
  };
};

// ============ HELPERS ============
export const generateOrderId = () => `4N-${Date.now()}`;

export const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `INV/${year}/${month}/${random}`;
};

export const calculateRefundPercentage = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 7) return 100;
  if (daysUntil >= 4) return 50;
  return 0;
};

const syncMotorStatus = async (motorId, rentalStatus) => {
  if (!motorId) return;
  let motorStatus = null;
  if (rentalStatus === "aktif") motorStatus = "rented";
  else if (rentalStatus === "selesai" || rentalStatus === "dibatalkan") motorStatus = "available";
  if (!motorStatus) return;
  const { error } = await supabase.from("motors").update({ status: motorStatus }).eq("id", motorId);
  if (error) console.warn("Gagal sync motor status:", error.message);
};

// ============ USER ============
export const createOrder = async (orderData) => {
  const dbPayload = mapOrderToDB(orderData);
  const { data, error } = await supabase.from("orders").insert([dbPayload]).select().single();
  if (error) {
    console.error("Gagal create order:", error.message);
    return { success: false, error: error.message, data: null };
  }
  return { success: true, data: mapOrderFromDB(data) };
};

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from("orders").select("*, motors(name, image_url)")
    .eq("user_id", userId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data.map(mapOrderFromDB) };
};

export const getOrderById = async (id) => {
  if (!id) return { success: false, error: "ID tidak valid", data: null };
  const { data, error } = await supabase
    .from("orders").select("*, motors(name, image_url)").eq("id", id).single();
  if (error) return { success: false, error: error.message, data: null };
  return { success: true, data: mapOrderFromDB(data) };
};

export const getOrderByOrderId = async (orderId) => {
  if (!orderId) return { success: false, error: "Order ID tidak valid", data: null };
  const { data, error } = await supabase
    .from("orders").select("*, motors(name, image_url)").eq("order_id", orderId).single();
  if (error) return { success: false, error: error.message, data: null };
  return { success: true, data: mapOrderFromDB(data) };
};

export const cancelOrder = async (id, order, bankData = {}) => {
  const refundPercentage = calculateRefundPercentage(order.startDate);
  const refundAmount = Math.round((order.amountPaid || 0) * (refundPercentage / 100));

  const { error } = await supabase
    .from("orders")
    .update({
      rental_status: "dibatalkan",
      cancelled_at: new Date().toISOString(),
      refund_amount: refundAmount,
      refund_status: refundAmount > 0 ? "pending" : "none",
      refund_bank_name: bankData.bankName || null,
      refund_bank_account: bankData.bankAccount || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Gagal cancel order:", error.message);
    return { success: false, error: error.message, data: null };
  }
  await syncMotorStatus(order.motorId, "dibatalkan");
  return await getOrderById(id);
};

// ============ ADMIN ============
export const getAllOrders = async () => {
  const { data, error } = await supabase
    .from("orders").select("*, motors(name, image_url)")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data.map(mapOrderFromDB) };
};

export const updateOrder = async (id, updates) => {
  const dbUpdates = {};
  if (updates.rentalStatus) dbUpdates.rental_status = updates.rentalStatus;
  if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.amountPaid !== undefined) dbUpdates.amount_paid = updates.amountPaid;
  if (updates.amountDue !== undefined) dbUpdates.amount_due = updates.amountDue;
  if (updates.identityHeld !== undefined) dbUpdates.identity_held = updates.identityHeld;
  if (updates.refundStatus) dbUpdates.refund_status = updates.refundStatus;
  if (updates.refundNote !== undefined) dbUpdates.refund_note = updates.refundNote;
  if (updates.refundTransferredAt) dbUpdates.refund_transferred_at = updates.refundTransferredAt;
  if (updates.refundAmount !== undefined) dbUpdates.refund_amount = updates.refundAmount;
  if (updates.cancelledAt) dbUpdates.cancelled_at = updates.cancelledAt;

  const { data: existingOrder } = await supabase
    .from("orders").select("motor_id").eq("id", id).single();

  const { error } = await supabase.from("orders").update(dbUpdates).eq("id", id);
  if (error) return { success: false, error: error.message, data: null };

  if (updates.rentalStatus && existingOrder?.motor_id) {
    await syncMotorStatus(existingOrder.motor_id, updates.rentalStatus);
  }
  return await getOrderById(id);
};

export const processRefund = async (id, { note, amount }) => {
  const { error } = await supabase
    .from("orders")
    .update({
      refund_status: "processed",
      refund_note: note || "Refund telah ditransfer",
      refund_transferred_at: new Date().toISOString(),
      refund_amount: amount,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message, data: null };
  return await getOrderById(id);
};

export const getRefundOrders = async () => {
  const { data, error } = await supabase
    .from("orders").select("*, motors(name, image_url)")
    .gt("refund_amount", 0)
    .order("cancelled_at", { ascending: false, nullsFirst: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data.map(mapOrderFromDB) };
};