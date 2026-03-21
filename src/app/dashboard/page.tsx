import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BatteryCharging,
  Droplets,
  ReceiptText,
  Users,
  Copy,
} from "lucide-react";
import { DashboardChart } from "@/components/dashboard-chart";
import { CopyHouseId } from "@/components/copy-house-id";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // Get tenant and house
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, houses(*)")
    .eq("user_id", user.id)
    .single();

  if (!tenant) return redirect("/setup");

  const houseId = tenant.house_id;

  // Fetch some basic stats
  const { count: tenantCount } = await supabase
    .from("tenants")
    .select("*", { count: "exact", head: true })
    .eq("house_id", houseId)
    .eq("is_active", true);

  // Fetch All Readings for the Chart & Recent Activity
  const { data: readings } = await supabase
    .from("readings")
    .select("*")
    .eq("house_id", houseId)
    .order("created_at", { ascending: false })
    .limit(10);

  const latestElec = readings?.find((r) => r.type === "electricity");

  // Outstanding Balance
  const { data: pendingPayments } = await supabase
    .from("payments")
    .select("amount_due")
    .eq("tenant_id", tenant.id)
    .eq("status", "pending");

  const totalOutstanding =
    pendingPayments?.reduce((sum, p) => sum + Number(p.amount_due), 0) || 0;

  // Format Chart Data (last 6 electricity readings, reversed to be chronological)
  const chartData = (readings || [])
    .filter((r) => r.type === "electricity")
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      name: new Date(r.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      units: Number(r.units_used),
    }));

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
          {greeting}, <span className="gradient-text">{tenant.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
          Overview for{" "}
          <strong className="text-foreground">{tenant.houses.name}</strong>
          {tenant.houses.created_by === user.id && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          )}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Outstanding Balance */}
        <Card
          className="card-hover stat-card-danger animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <ReceiptText className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl sm:text-2xl font-display font-bold ${totalOutstanding > 0 ? "text-destructive" : "text-green-500"}`}
            >
              ₦{totalOutstanding.toLocaleString()}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {totalOutstanding > 0 ? "Pending payments" : "All caught up! 🎉"}
            </p>
          </CardContent>
        </Card>

        {/* Latest Electricity */}
        <Card
          className="card-hover stat-card-elec animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Latest Electricity
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BatteryCharging className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-display font-bold">
              {latestElec ? latestElec.units_used : 0}
              <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                units
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {latestElec
                ? `${new Date(latestElec.created_at).toLocaleDateString("en-GB")}`
                : "No readings yet"}
            </p>
          </CardContent>
        </Card>

        {/* Active Tenants */}
        <Card
          className="card-hover stat-card-success animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Tenants
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-display font-bold">
              {tenantCount || 0}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              Sharing bills
            </p>
          </CardContent>
        </Card>

        {/* House ID */}
        <Card
          className="card-hover animate-fade-in"
          style={{ animationDelay: "0.25s" }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              House ID
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Copy className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <CopyHouseId houseId={houseId} />
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              Share to invite tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Activity */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-7">
        <Card
          className="lg:col-span-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Usage History
            </CardTitle>
            <CardDescription>Electricity consumption over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-[280px] sm:h-[350px]">
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card
          className="lg:col-span-3 animate-fade-in"
          style={{ animationDelay: "0.35s" }}
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Recent Activity
            </CardTitle>
            <CardDescription>Latest readings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!readings || readings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Droplets className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No recent activity
                  </p>
                </div>
              ) : (
                readings.slice(0, 5).map((r, i) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        r.type === "electricity"
                          ? "bg-primary/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {r.type === "electricity" ? (
                        <BatteryCharging className="h-4 w-4 text-primary" />
                      ) : (
                        <Droplets className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm truncate">
                          {r.type === "electricity"
                            ? "Electricity"
                            : "Pumping Machine"}
                        </span>
                        <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                          {new Date(r.created_at).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {r.units_used} Units
                        </span>
                        <span className="font-bold text-sm text-destructive">
                          ₦{Number(r.total_cost).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
