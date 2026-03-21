"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markAsPaid } from "@/app/dashboard/payments/actions";
import {
  CheckCircle2,
  Share2,
  Upload,
  Clock,
  Zap,
  Droplets,
  X,
} from "lucide-react";

function getSplitLabel(splitType: string) {
  if (splitType === "individual") return "Only You";
  if (splitType === "equal") return "Split Equally";
  return "Custom Split";
}

export function CombinedPaymentCard({
  date,
  payments,
}: {
  date: string;
  payments: any[];
}) {
  const [isPending, startTransition] = useTransition();
  const [showUpload, setShowUpload] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allPaid = payments.every((p) => p.status === "paid");
  const anyPendingApproval = payments.some(
    (p) => p.status === "pending_approval",
  );
  const anyPending = payments.some((p) => p.status === "pending");

  const totalOwed = payments.reduce((sum, p) => sum + Number(p.amount_due), 0);

  const handleShare = () => {
    let summary = `⚡ *MeterMate Bill Summary*\n📅 ${date}\n\n`;

    payments.forEach((p) => {
      const r = p.bills?.readings;
      const isElec = r?.type === "electricity";
      summary += `${isElec ? "⚡ Electricity" : "💧 Pumping Machine"}\n`;
      summary += `  Prev: ${r?.previous_reading} → Curr: ${r?.current_reading}\n`;
      summary += `  Units: ${r?.units_used} × ₦${r?.unit_price}\n`;
      summary += `  Split: ${getSplitLabel(r?.split_type)}\n`;
      summary += `  *Your Share: ₦${Number(p.amount_due).toLocaleString()}*\n\n`;
    });

    summary += `*Total You Owe: ₦${totalOwed.toLocaleString()}*\n\nTracked with MeterMate ⚡`;

    if (navigator.share) {
      navigator
        .share({ title: "MeterMate Bill", text: summary })
        .catch(console.error);
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(summary)}`,
        "_blank",
      );
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>, paymentId: string) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, [paymentId]: "" }));
    const formData = new FormData(e.currentTarget);
    formData.append("payment_id", paymentId);

    startTransition(async () => {
      const res = await markAsPaid(formData);
      if (res?.error) {
        setErrors((prev) => ({ ...prev, [paymentId]: res.error! }));
      } else {
        setShowUpload(null);
      }
    });
  };

  const statusConfig = allPaid
    ? { border: "border-green-500/20", bg: "bg-green-500/[0.02]" }
    : anyPendingApproval
      ? { border: "border-yellow-500/30", bg: "bg-yellow-500/[0.02]" }
      : { border: "border-destructive/20", bg: "" };

  return (
    <Card
      className={`${statusConfig.border} ${statusConfig.bg} card-hover overflow-hidden`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-display">
            Bill — {date}
          </CardTitle>
          <Badge
            variant={
              allPaid
                ? "secondary"
                : anyPendingApproval
                  ? "outline"
                  : "destructive"
            }
            className={`text-[10px] ${
              anyPendingApproval
                ? "border-yellow-500/50 text-yellow-600 bg-yellow-500/10"
                : allPaid
                  ? "text-green-600 bg-green-500/10 border-green-500/20"
                  : ""
            }`}
          >
            {allPaid
              ? "✅ Paid"
              : anyPendingApproval
                ? "⏳ Awaiting"
                : "❗ Unpaid"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {payments.map((p) => {
          const r = p.bills?.readings;
          const isElec = r?.type === "electricity";
          const isPaid = p.status === "paid";
          const isPendingApproval = p.status === "pending_approval";

          return (
            <div key={p.id} className="space-y-2">
              <div
                className={`rounded-lg p-3 space-y-2 border-l-[3px] ${
                  isElec
                    ? "bg-primary/[0.03] border-l-primary"
                    : "bg-blue-500/[0.03] border-l-blue-500"
                }`}
              >
                {/* Meter type header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded-md flex items-center justify-center ${
                        isElec ? "bg-primary/10" : "bg-blue-500/10"
                      }`}
                    >
                      {isElec ? (
                        <Zap className="h-3 w-3 text-primary" />
                      ) : (
                        <Droplets className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      {isElec ? "Electricity" : "Pumping Machine"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {getSplitLabel(r?.split_type)}
                  </Badge>
                </div>

                {/* Reading details */}
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="flex justify-between">
                    <span>Prev → Curr</span>
                    <span>
                      {r?.previous_reading} → {r?.current_reading}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Units × Price</span>
                    <span>
                      {r?.units_used} × ₦{r?.unit_price}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-foreground pt-0.5">
                    <span>Total Bill</span>
                    <span>₦{Number(r?.total_cost).toLocaleString()}</span>
                  </div>
                </div>

                {/* Split breakdown */}
                <div className="bg-background/60 rounded-md p-2 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {r?.split_type === "individual"
                        ? "Paid by you alone"
                        : r?.split_type === "equal"
                          ? `Split equally ÷ ${Math.round(Number(r?.total_cost) / Number(p.amount_due))} people`
                          : `Custom split ÷ ${Math.round(Number(r?.total_cost) / Number(p.amount_due))} people`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border/50 pt-1">
                    <span className="font-semibold text-foreground">
                      Your Share
                    </span>
                    <span className="font-bold text-primary text-sm">
                      ₦{Number(p.amount_due).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                {isPaid && (
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle2 className="h-3 w-3" /> Paid
                  </div>
                )}
                {isPendingApproval && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <Clock className="h-3 w-3" /> Awaiting approval
                  </div>
                )}
              </div>

              {/* Upload form */}
              {showUpload === p.id && !isPaid && !isPendingApproval && (
                <form
                  onSubmit={(e) => onSubmit(e, p.id)}
                  className="space-y-2 border rounded-lg p-3 bg-muted/20"
                >
                  <Label className="text-xs flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Upload Receipt
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="file"
                    name="proof_image"
                    accept="image/*"
                    required
                    className="cursor-pointer text-xs"
                  />
                  {errors[p.id] && (
                    <p className="text-xs text-destructive">{errors[p.id]}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-1/2 text-xs"
                      onClick={() => setShowUpload(null)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending}
                      className="w-1/2 text-xs"
                    >
                      {isPending ? "Uploading..." : "Submit"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Mark as paid button */}
              {!isPaid && !isPendingApproval && showUpload !== p.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                  onClick={() => setShowUpload(p.id)}
                >
                  <Upload className="h-3 w-3 mr-1.5" />
                  Mark {isElec ? "Electricity" : "Pumping"} as Paid
                </Button>
              )}
            </div>
          );
        })}

        {/* Total */}
        <div className="flex justify-between items-center border-t pt-3 mt-1">
          <span className="font-bold text-sm">Total This Period</span>
          <span className="font-bold text-lg gradient-text">
            ₦{totalOwed.toLocaleString()}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/10 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
          onClick={handleShare}
        >
          <Share2 className="w-3.5 h-3.5 mr-2" /> Share on WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
}
