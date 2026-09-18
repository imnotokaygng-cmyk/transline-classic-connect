import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const stkInput = z.object({
  bookingId: z.string().uuid(),
  phone: z.string().min(9).max(15),
});

const statusInput = z.object({
  bookingId: z.string().uuid(),
});

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 9 && digits.startsWith("7")) {
    return `254${digits}`;
  }

  if (digits.length === 9 && digits.startsWith("1")) {
    return `254${digits}`;
  }

  if (digits.length === 10 && digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("254")) {
    return digits;
  }

  return null;
}

function kenyaTimestamp(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return (
    `${get("year")}${get("month")}${get("day")}` +
    `${get("hour")}${get("minute")}${get("second")}`
  );
}

function limitText(value: string, max: number): string {
  return value.slice(0, max);
}

export const initiateMpesaPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => stkInput.parse(data))
  .handler(async ({ data }) => {
    const msisdn = normalizePhone(data.phone);

    if (!msisdn) {
      return {
        ok: false as const,
        code: "INVALID_PHONE",
        message:
          "Enter a valid Safaricom number, e.g. 0712345678.",
      };
    }

    const consumerKey = process.env["MPESA_CONSUMER_KEY"];
    const consumerSecret = process.env["MPESA_CONSUMER_SECRET"];
    const passkey = process.env["MPESA_PASSKEY"];
    const shortcode = process.env["MPESA_SHORTCODE"];

    const transactionType =
      process.env["MPESA_TRANSACTION_TYPE"] ??
      "CustomerPayBillOnline";

    const callbackPath = "/api/public/mpesa/callback";

    const withPath = (origin: string) =>
      origin.includes(callbackPath)
        ? origin
        : `${origin.replace(/\/$/, "")}${callbackPath}`;

    const callbackUrl = withPath(
      process.env["MPESA_CALLBACK_URL"] ??
        (process.env["VERCEL_URL"]
          ? `https://${process.env["VERCEL_URL"]}`
          : null) ??
        process.env["VITE_PUBLIC_URL"] ??
        "https://transline-classic-connect.vercel.app",
    );

    const base =
      (process.env["MPESA_ENV"] ?? "sandbox") === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id,booking_ref,fare_amount,payment_status",
      )
      .eq("id", data.bookingId)
      .maybeSingle();

    if (error || !booking) {
      return {
        ok: false as const,
        code: "NOT_FOUND",
        message: "We could not find that booking.",
      };
    }

    if (booking.payment_status === "paid") {
      return {
        ok: true as const,
        alreadyPaid: true,
        message: "This booking is already paid.",
      };
    }

    if (
      !consumerKey ||
      !consumerSecret ||
      !passkey ||
      !shortcode
    ) {
      return {
        ok: false as const,
        code: "NOT_CONFIGURED",
        message:
          "M-PESA payment is not yet activated online. Please contact our office to complete payment.",
      };
    }

    try {
      // Get Daraja access token
      const auth = Buffer.from(
        `${consumerKey}:${consumerSecret}`,
      ).toString("base64");

      const tokenRes = await fetch(
        `${base}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      const tokenJson = (await tokenRes.json()) as {
        access_token?: string;
        errorCode?: string;
        errorMessage?: string;
      };

      if (!tokenRes.ok || !tokenJson.access_token) {
        console.error("Daraja token request failed", {
          status: tokenRes.status,
          errorCode: tokenJson.errorCode,
          errorMessage: tokenJson.errorMessage,
        });

        return {
          ok: false as const,
          code: "AUTH_FAILED",
          message:
            tokenJson.errorMessage ??
            "M-PESA authentication failed. Please check the Daraja credentials and environment.",
        };
      }

      // Daraja timestamp in Kenya time
      const timestamp = kenyaTimestamp();

      const password = Buffer.from(
        `${shortcode}${passkey}${timestamp}`,
      ).toString("base64");

      // Booking amount
      const amount = Math.round(
        Number(booking.fare_amount ?? 0),
      );

      if (!Number.isFinite(amount) || amount < 1) {
        return {
          ok: false as const,
          code: "INVALID_AMOUNT",
          message:
            "The booking has an invalid payment amount.",
        };
      }

      // Daraja field length limits
      const accountReference = limitText(
        String(
          booking.booking_ref ?? "TRANSLINE",
        ),
        12,
      );

      const transactionDesc = limitText(
        `Bus ticket ${
          booking.booking_ref ?? ""
        }`.trim(),
        13,
      );

      // Send STK Push
      const stkRes = await fetch(
        `${base}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: transactionType,
            Amount: amount,
            PartyA: msisdn,
            PartyB: shortcode,
            PhoneNumber: msisdn,
            CallBackURL: callbackUrl,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc,
          }),
        },
      );

      const stkJson = (await stkRes.json()) as {
        CheckoutRequestID?: string;
        ResponseCode?: string;
        ResponseDescription?: string;
        CustomerMessage?: string;
        errorCode?: string;
        errorMessage?: string;
      };

      if (
        !stkRes.ok ||
        stkJson.ResponseCode !== "0" ||
        !stkJson.CheckoutRequestID
      ) {
        console.error("STK push failed", {
          status: stkRes.status,
          responseCode: stkJson.ResponseCode,
          errorCode: stkJson.errorCode,
          errorMessage: stkJson.errorMessage,
          responseDescription:
            stkJson.ResponseDescription,
        });

        return {
          ok: false as const,
          code: "STK_FAILED",
          message:
            stkJson.CustomerMessage ??
            stkJson.errorMessage ??
            stkJson.ResponseDescription ??
            "We could not send the M-PESA prompt. Please try again in a moment.",
        };
      }

      // Save payment request
      const { error: paymentInsertError } =
        await supabaseAdmin
          .from("payments")
          .insert({
            reference_type: "booking",
            reference_id: booking.id,
            phone: msisdn,
            amount,
            mpesa_checkout_request_id:
              stkJson.CheckoutRequestID,
            status: "pending",
          });

      if (paymentInsertError) {
        console.error(
          "Payment record insert failed",
          {
            message: paymentInsertError.message,
            code: paymentInsertError.code,
          },
        );

        return {
          ok: false as const,
          code: "PAYMENT_RECORD_FAILED",
          message:
            "M-PESA prompt was sent, but we could not save the payment record. Please contact the office before trying again.",
        };
      }

      return {
        ok: true as const,
        alreadyPaid: false,
        checkoutRequestId:
          stkJson.CheckoutRequestID,
        message:
          "Check your phone and enter your M-PESA PIN to complete payment.",
      };
    } catch (err) {
      console.error(
        "M-PESA error",
        err instanceof Error
          ? err.message
          : "Unknown error",
      );

      return {
        ok: false as const,
        code: "NETWORK",
        message:
          "We could not reach M-PESA right now. Please try again shortly.",
      };
    }
  });

export const getBookingPaymentStatus = createServerFn({
  method: "POST",
})
  .inputValidator((data: unknown) =>
    statusInput.parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select(
        "payment_status,mpesa_receipt,booking_ref",
      )
      .eq("id", data.bookingId)
      .maybeSingle();

    return {
      status:
        booking?.payment_status ?? "pending",
      receipt:
        booking?.mpesa_receipt ?? null,
      bookingRef:
        booking?.booking_ref ?? null,
    };
  });
