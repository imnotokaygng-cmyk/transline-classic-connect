import { createFileRoute } from "@tanstack/react-router";

interface CallbackItem {
  Name: string;
  Value?: string | number;
}

export const Route = createFileRoute("/api/public/mpesa/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const stk = (payload as { Body?: { stkCallback?: Record<string, unknown> } }).Body
          ?.stkCallback;
        const checkoutId = stk?.["CheckoutRequestID"] as string | undefined;
        const resultCode = Number(stk?.["ResultCode"] ?? -1);

        if (!checkoutId) {
          return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id,reference_id,reference_type,status")
          .eq("mpesa_checkout_request_id", checkoutId)
          .maybeSingle();

        if (!payment) {
          console.error("M-PESA callback for unknown checkout id");
          return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
        }

        const items =
          ((stk?.["CallbackMetadata"] as { Item?: CallbackItem[] } | undefined)?.Item ?? []) as
            CallbackItem[];
        const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value as
          | string
          | undefined;

        if (resultCode === 0) {
          await supabaseAdmin
            .from("payments")
            .update({
              status: "paid",
              mpesa_receipt_number: receipt ?? null,
              raw_callback: payload as never,
            })
            .eq("id", payment.id);

          if (payment.reference_type === "booking") {
            await supabaseAdmin
              .from("bookings")
              .update({ payment_status: "paid", mpesa_receipt: receipt ?? null })
              .eq("id", payment.reference_id);
          }
        } else {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed", raw_callback: payload as never })
            .eq("id", payment.id);
        }

        return Response.json({ ResultCode: 0, ResultDesc: "Accepted" });
      },
    },
  },
});
