import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const stkInput = z.object({
  bookingId: z.string().uuid(),
  phone: z.string().min(9).max(15),
});

const statusInput = z.object({ bookingId: z.string().uuid() });

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9 && digits.startsWith("7")) return `254${digits}`;
  if (digits.length === 9 && digits.startsWith("1")) return `254${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("254")) return digits;
  return null;
}

export const initiateMpesaPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => stkInput.parse(data))
  .handler(async ({ data }) => {
    const msisdn = normalizePhone(data.phone);
    if (!msisdn) {
      return { ok: false as const, code: "INVALID_PHONE", message: "Enter a valid Safaricom number, e.g. 0712345678." };
    }

    const consumerKey = process.env["MPESA_CONSUMER_KEY"];
    const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
    const passkey = process.env["MPESA_PASSKEY"];
    const shortcode = process.env["MPESA_SHORTCODE"];
    const callbackUrl = process.env["MPESA_CALLBACK_URL"];
    const base =
      (process.env["MPESA_ENV"] ?? "sandbox") === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id,booking_ref,fare_amount,payment_status")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { ok: false as const, code: "NOT_FOUND", message: "We could not find that booking." };
    }
    if (booking.payment_status === "paid") {
      return { ok: true as const, alreadyPaid: true, message: "This booking is already paid." };
    }

    if (!consumerKey || !consumerSecret || !passkey || !shortcode || !callbackUrl) {
      return {
        ok: false as const,
        code: "NOT_CONFIGURED",
        message:
          "M-PESA payment is not yet activated online. Your seat is reserved as pending — please contact our office to complete payment.",
      };
    }

    try {
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
      const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      const tokenJson = (await tokenRes.json()) as { access_token?: string };
      if (!tokenRes.ok || !tokenJson.access_token) {
        throw new Error("Daraja token request failed");
      }

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const timestamp =
        `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
        `${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
      const amount = Math.max(1, Math.round(Number(booking.fare_amount ?? 0)));

      const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: msisdn,
          PartyB: shortcode,
          PhoneNumber: msisdn,
          CallBackURL: callbackUrl,
          AccountReference: booking.booking_ref ?? "TRANSLINE",
          TransactionDesc: `Bus ticket ${booking.booking_ref ?? ""}`.trim(),
        }),
      });
      const stkJson = (await stkRes.json()) as {
        CheckoutRequestID?: string;
        ResponseCode?: string;
        errorMessage?: string;
      };

      if (!stkRes.ok || stkJson.ResponseCode !== "0" || !stkJson.CheckoutRequestID) {
        console.error("STK push failed", stkJson);
        return {
          ok: false as const,
          code: "STK_FAILED",
          message: "We could not send the M-PESA prompt. Please try again in a moment.",
        };
      }

      await supabaseAdmin.from("payments").insert({
        reference_type: "booking",
        reference_id: booking.id,
        phone: msisdn,
        amount,
        mpesa_checkout_request_id: stkJson.CheckoutRequestID,
        status: "pending",
      });

      return {
        ok: true as const,
        alreadyPaid: false,
        checkoutRequestId: stkJson.CheckoutRequestID,
        message: "Check your phone and enter your M-PESA PIN to complete payment.",
      };
    } catch (err) {
      console.error("M-PESA error", err);
      return {
        ok: false as const,
        code: "NETWORK",
        message: "We could not reach M-PESA right now. Please try again shortly.",
      };
    }
  });

export const getBookingPaymentStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("payment_status,mpesa_receipt,booking_ref")
      .eq("id", data.bookingId)
      .maybeSingle();
    return {
      status: booking?.payment_status ?? "pending",
      receipt: booking?.mpesa_receipt ?? null,
      bookingRef: booking?.booking_ref ?? null,
    };
  });
