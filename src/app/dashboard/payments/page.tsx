import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CombinedPaymentCard } from "@/components/payment-card";
import { AlertCircle, CheckCircle2, History } from "lucide-react";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, house_id")
    .eq("user_id", user.id)
    .single();

  if (!tenant) redirect("/setup");

  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      *,
      bills (
        id,
        created_at,
        total_amount,
        split_amount,
        readings (
          id,
          type,
          previous_reading,
          current_reading,
          units_used,
          unit_price,
          total_cost,
          split_type,
          proof_image_url
        )
      )
    `,
    )
    .eq("tenant_id", tenant.id)
    .order("created_at", { referencedTable: "bills", ascending: false });

  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <History className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">No Bills Yet</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          When a new meter reading is submitted, your split bill will appear
          here.
        </p>
      </div>
    );
  }

  // Group payments by bill date (same day submissions = one group)
  const groups: Record<string, typeof payments> = {};
  payments.forEach((p) => {
    const date = new Date(p.bills?.created_at).toLocaleDateString("en-GB");
    if (!groups[date]) groups[date] = [];
    groups[date].push(p);
  });

  const pending = Object.entries(groups).filter(([, items]) =>
    items.some(
      (p) => p.status === "pending" || p.status === "pending_approval",
    ),
  );
  const paid = Object.entries(groups).filter(([, items]) =>
    items.every((p) => p.status === "paid"),
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Unpaid Bills */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Unpaid Bills</h1>
        </div>
        {pending.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              You are all caught up! 🎉
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(([date, items]) => (
              <CombinedPaymentCard key={date} date={date} payments={items} />
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <div className="flex items-center gap-2.5 mb-4 pt-6 border-t">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <History className="h-4 w-4 text-muted-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">
            Payment History
          </h1>
        </div>
        {paid.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No payment history yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paid.map(([date, items]) => (
              <CombinedPaymentCard key={date} date={date} payments={items} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
