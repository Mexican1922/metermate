import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApproveButton, RejectButton, DeactivateButton } from "./admin-buttons";
import { AddTenantForm } from "./admin-forms";
import { Shield, Clock, Users, ShieldAlert } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("house_id, houses(created_by)")
    .eq("user_id", user.id)
    .single();

  // @ts-ignore
  if (!tenant || tenant.houses?.created_by !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Unauthorized</h2>
        <p className="text-muted-foreground text-sm">
          You are not the admin of this house.
        </p>
      </div>
    );
  }

  const houseId = tenant.house_id;

  // Fetch Tenants
  const { data: houseTenants } = await supabase
    .from("tenants")
    .select(
      `
      id,
      name,
      user_id,
      is_active,
      payments (
        amount_due,
        status
      )
    `,
    )
    .eq("house_id", houseId)
    .order("name");

  const tenantIds = houseTenants?.map((t: any) => t.id) || [];

  // Fetch Pending Approvals
  const { data: pendingPayments } = await supabase
    .from("payments")
    .select(
      `
      *,
      tenants ( name ),
      bills (
        created_at,
        readings (
          type
        )
      )
    `,
    )
    .in("tenant_id", tenantIds)
    .eq("status", "pending_approval")
    .order("paid_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">House Admin</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[46px]">
          Manage payment approvals and active tenants.
        </p>
      </div>

      {/* Add Tenant */}
      <AddTenantForm />

      {/* Pending Approvals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <h2 className="text-lg font-display font-bold">
            Pending Approvals
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({pendingPayments?.length || 0})
            </span>
          </h2>
        </div>

        {!pendingPayments || pendingPayments.length === 0 ? (
          <div className="border border-dashed rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No payments waiting for approval.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPayments.map((p: any) => (
              <Card
                key={p.id}
                className="border-yellow-500/30 overflow-hidden flex flex-col card-hover"
              >
                <CardHeader className="pb-3 bg-yellow-500/[0.03]">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-display">
                      {p.tenants?.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-yellow-500/50 text-yellow-600 bg-yellow-500/10 text-[10px]"
                    >
                      Review
                    </Badge>
                  </div>
                  <CardDescription>
                    {p.bills?.readings?.type === "electricity"
                      ? "⚡ Electricity"
                      : "💧 Pumping Machine"}
                    {" · "}₦ {Number(p.amount_due).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex items-center justify-center bg-muted/20">
                  {p.proof_image_url ? (
                    <a
                      href={p.proof_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full relative h-48 block group overflow-hidden"
                    >
                      <img
                        src={p.proof_image_url}
                        alt="Payment Proof"
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </a>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-muted-foreground text-sm font-medium gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        📷
                      </div>
                      No Image Provided
                    </div>
                  )}
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 p-3 bg-background border-t">
                  <RejectButton paymentId={p.id} />
                  <ApproveButton paymentId={p.id} payment={p} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tenants */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-green-500" />
          </div>
          <h2 className="text-lg font-display font-bold">
            Tenants
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({houseTenants?.filter((t) => t.is_active).length || 0} active)
            </span>
          </h2>
        </div>
        <div className="grid gap-3">
          {houseTenants?.map((t: any) => {
            const isMe = t.user_id === user.id;
            const outstanding =
              t.payments
                ?.filter(
                  (p: any) =>
                    p.status === "pending" || p.status === "pending_approval",
                )
                .reduce(
                  (sum: number, p: any) => sum + Number(p.amount_due),
                  0,
                ) || 0;

            return (
              <Card
                key={t.id}
                className={`transition-opacity duration-300 ${!t.is_active ? "opacity-40" : ""}`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-display font-bold text-primary">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">{t.name}</h3>
                        {isMe && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Admin (You)
                          </Badge>
                        )}
                        {!t.is_active && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {t.is_active && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Balance:{" "}
                          <strong
                            className={
                              outstanding > 0
                                ? "text-destructive"
                                : "text-green-500"
                            }
                          >
                            ₦{outstanding.toLocaleString()}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>
                  {t.is_active && !isMe && (
                    <div className="w-full sm:w-auto">
                      <DeactivateButton tenantId={t.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
