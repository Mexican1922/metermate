import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AddReadingForm } from "@/components/add-reading-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProofImage } from "@/components/proof-image";
import { Zap, Droplets, FileText } from "lucide-react";

export default async function ReadingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, house_id")
    .eq("user_id", user.id)
    .single();

  if (!tenant) return redirect("/setup");

  const houseId = tenant.house_id;

  // Fetch all active tenants for the split selector
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("house_id", houseId)
    .eq("is_active", true);

  // Fetch recent readings
  const { data: readings } = await supabase
    .from("readings")
    .select("*")
    .eq("house_id", houseId)
    .order("created_at", { ascending: false })
    .limit(10);

  const latestElec = readings?.find((r) => r.type === "electricity");
  const latestPump = readings?.find((r) => r.type === "pumping_machine");

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Form */}
      <div className="w-full lg:w-[380px] xl:w-[420px] lg:shrink-0 animate-fade-in">
        <AddReadingForm
          latestElecReading={latestElec?.current_reading}
          latestPumpReading={latestPump?.current_reading}
          tenants={tenants || []}
          currentTenantId={tenant.id}
        />
      </div>

      {/* History */}
      <div className="flex-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-lg">Recent Readings</CardTitle>
                <CardDescription className="text-xs">
                  Last 10 readings for your house
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!readings || readings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No readings found yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit your first reading using the form
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {readings.map((r) => {
                  const isElec = r.type === "electricity";
                  return (
                    <div
                      key={r.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors duration-200 border-l-[3px] ${
                        isElec ? "border-l-primary" : "border-l-blue-500"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center ${
                            isElec ? "bg-primary/10" : "bg-blue-500/10"
                          }`}>
                            {isElec ? (
                              <Zap className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Droplets className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </div>
                          <span className="font-semibold text-sm">
                            {isElec ? "Electricity" : "Pumping Machine"}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {r.units_used} Units
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {r.split_type === "individual"
                              ? "Only Me"
                              : r.split_type === "equal"
                                ? "Split All"
                                : "Custom"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("en-GB")}{" "}
                          · {r.previous_reading} → {r.current_reading}
                        </p>
                        <div className="mt-1">
                          <ProofImage url={r.proof_image_url} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-destructive text-base">
                          ₦{Number(r.total_cost).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          @ ₦{r.unit_price}/unit
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
