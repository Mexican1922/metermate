"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approvePayment, rejectPayment, deactivateTenant } from "./actions";
import { CheckCircle, XCircle, UserMinus } from "lucide-react";

function openWhatsApp(payment: any) {
  const tenantName = payment.tenants?.name || "Tenant";
  const amount = Number(payment.amount_due).toLocaleString();
  const type =
    payment.bills?.readings?.type === "electricity"
      ? "Electricity"
      : "Pumping Machine";
  const date = new Date().toLocaleDateString("en-GB");

  const message =
    `✅ *Payment Confirmed - MeterMate*\n\n` +
    `Hi ${tenantName},\n\n` +
    `Your payment has been received and confirmed! 🎉\n\n` +
    `📋 *Details:*\n` +
    `• Type: ${type}\n` +
    `• Amount Paid: ₦${amount}\n` +
    `• Confirmed on: ${date}\n\n` +
    `Thank you for paying on time! ⚡`;

  if (typeof navigator !== "undefined" && navigator.share) {
    navigator
      .share({ title: "Payment Confirmed", text: message })
      .catch(console.error);
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }
}

export function ApproveButton({
  paymentId,
  payment,
}: {
  paymentId: string;
  payment: any;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      onClick={() =>
        startTransition(async () => {
          const res = await approvePayment(paymentId);
          if (!res?.error) {
            // Open WhatsApp after successful approval
            openWhatsApp(payment);
          }
        })
      }
      disabled={isPending}
      className="bg-green-600 hover:bg-green-700 text-white w-full"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {isPending ? "..." : "Approve & Notify"}
    </Button>
  );
}

export function RejectButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={() =>
        startTransition(async () => {
          await rejectPayment(paymentId);
        })
      }
      disabled={isPending}
      className="w-full"
    >
      <XCircle className="w-4 h-4 mr-2" />
      {isPending ? "..." : "Reject"}
    </Button>
  );
}

export function DeactivateButton({ tenantId }: { tenantId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-destructive hover:bg-destructive/10 w-full md:w-auto"
      onClick={() => {
        if (
          confirm(
            "Are you sure you want to deactivate this tenant? They will no longer be included in split bills.",
          )
        ) {
          startTransition(async () => {
            await deactivateTenant(tenantId);
          });
        }
      }}
      disabled={isPending}
    >
      <UserMinus className="w-4 h-4 mr-2" />
      {isPending ? "Deactivating..." : "Deactivate Tenant"}
    </Button>
  );
}
