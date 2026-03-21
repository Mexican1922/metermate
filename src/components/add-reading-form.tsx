"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { addReadings } from "@/app/dashboard/readings/actions";
import { useRouter } from "next/navigation";
import { Zap, Droplets, Camera, ArrowRight } from "lucide-react";

type Tenant = { id: string; name: string };

export function AddReadingForm({
  latestElecReading,
  latestPumpReading,
  tenants,
  currentTenantId,
}: {
  latestElecReading?: number;
  latestPumpReading?: number;
  tenants: Tenant[];
  currentTenantId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Electricity state
  const [elecPrev, setElecPrev] = useState(String(latestElecReading || 0));
  const [elecCurr, setElecCurr] = useState("");
  const [elecSplit, setElecSplit] = useState("individual");
  const [elecTenants, setElecTenants] = useState<string[]>([]);
  const [includeElec, setIncludeElec] = useState(true);

  // Pumping machine state
  const [pumpPrev, setPumpPrev] = useState(String(latestPumpReading || 0));
  const [pumpCurr, setPumpCurr] = useState("");
  const [pumpSplit, setPumpSplit] = useState("equal");
  const [pumpTenants, setPumpTenants] = useState<string[]>([]);
  const [includePump, setIncludePump] = useState(true);

  // Shared unit price
  const [unitPrice, setUnitPrice] = useState("250");

  const toggleTenant = (
    id: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(list.includes(id) ? list.filter((t) => t !== id) : [...list, id]);
  };

  // Calculations
  const price = parseFloat(unitPrice || "0");
  const elecUnits = Math.max(
    0,
    parseFloat(elecCurr || "0") - parseFloat(elecPrev || "0"),
  );
  const pumpUnits = Math.max(
    0,
    parseFloat(pumpCurr || "0") - parseFloat(pumpPrev || "0"),
  );
  const elecTotal = elecUnits * price;
  const pumpTotal = pumpUnits * price;

  const getElecSplitCount = () =>
    elecSplit === "individual"
      ? 1
      : elecSplit === "equal"
        ? tenants.length
        : elecTenants.length || 1;

  const getPumpSplitCount = () =>
    pumpSplit === "individual"
      ? 1
      : pumpSplit === "equal"
        ? tenants.length
        : pumpTenants.length || 1;

  const myElecShare = includeElec
    ? elecSplit === "individual"
      ? elecTotal
      : elecSplit === "equal"
        ? elecTotal / getElecSplitCount()
        : elecTenants.includes(currentTenantId)
          ? elecTotal / getElecSplitCount()
          : 0
    : 0;

  const myPumpShare = includePump
    ? pumpSplit === "individual"
      ? pumpTotal
      : pumpSplit === "equal"
        ? pumpTotal / getPumpSplitCount()
        : pumpTenants.includes(currentTenantId)
          ? pumpTotal / getPumpSplitCount()
          : 0
    : 0;

  const myTotal = myElecShare + myPumpShare;

  const canSubmit =
    (includeElec && elecUnits > 0) || (includePump && pumpUnits > 0);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    // Append tenant selections
    elecTenants.forEach((id) => formData.append("elec_split_tenant_ids", id));
    pumpTenants.forEach((id) => formData.append("pump_split_tenant_ids", id));

    startTransition(async () => {
      const res = await addReadings(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setElecCurr("");
        setPumpCurr("");
        setElecTenants([]);
        setPumpTenants([]);
        router.refresh();
      }
    });
  };

  const SplitSelector = ({
    splitValue,
    onSplitChange,
    selectedTenants,
    onToggleTenant,
    prefix,
  }: {
    splitValue: string;
    onSplitChange: (v: string) => void;
    selectedTenants: string[];
    onToggleTenant: (id: string) => void;
    prefix: string;
  }) => (
    <RadioGroup
      name={`${prefix}_split_type`}
      value={splitValue}
      onValueChange={onSplitChange}
      className="space-y-1.5"
    >
      <div className={`flex items-start space-x-2 border rounded-lg p-2.5 transition-all duration-200 cursor-pointer ${splitValue === "individual" ? "border-primary/30 bg-primary/5" : "hover:bg-muted/30"}`}>
        <RadioGroupItem
          value="individual"
          id={`${prefix}-individual`}
          className="mt-0.5"
        />
        <div>
          <Label
            htmlFor={`${prefix}-individual`}
            className="cursor-pointer font-medium text-sm"
          >
            Only Me
          </Label>
          <p className="text-[11px] text-muted-foreground">I pay for this myself</p>
        </div>
      </div>
      <div className={`flex items-start space-x-2 border rounded-lg p-2.5 transition-all duration-200 cursor-pointer ${splitValue === "equal" ? "border-primary/30 bg-primary/5" : "hover:bg-muted/30"}`}>
        <RadioGroupItem
          value="equal"
          id={`${prefix}-equal`}
          className="mt-0.5"
        />
        <div>
          <Label
            htmlFor={`${prefix}-equal`}
            className="cursor-pointer font-medium text-sm"
          >
            Split Equally ({tenants.length})
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Divide among all tenants
          </p>
        </div>
      </div>
      <div className={`flex items-start space-x-2 border rounded-lg p-2.5 transition-all duration-200 cursor-pointer ${splitValue === "custom" ? "border-primary/30 bg-primary/5" : "hover:bg-muted/30"}`}>
        <RadioGroupItem
          value="custom"
          id={`${prefix}-custom`}
          className="mt-0.5"
        />
        <div className="w-full">
          <Label
            htmlFor={`${prefix}-custom`}
            className="cursor-pointer font-medium text-sm"
          >
            Specific Tenants
          </Label>
          {splitValue === "custom" && (
            <div className="space-y-1.5 mt-2">
              {tenants.map((t) => (
                <div key={t.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${prefix}-tenant-${t.id}`}
                    checked={selectedTenants.includes(t.id)}
                    onCheckedChange={() => onToggleTenant(t.id)}
                  />
                  <Label
                    htmlFor={`${prefix}-tenant-${t.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {t.name}
                    {t.id === currentTenantId && (
                      <span className="text-[10px] text-muted-foreground ml-1">
                        (you)
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RadioGroup>
  );

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-lg">Add Readings</CardTitle>
            <CardDescription className="text-xs">
              Submit electricity & pumping readings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="text-sm font-medium text-green-600 bg-green-500/10 p-3 rounded-lg flex items-center gap-2">
              <span className="shrink-0">✅</span> Readings submitted successfully!
            </div>
          )}

          {/* Unit Price */}
          <div className="space-y-2">
            <Label htmlFor="unit_price" className="text-sm font-medium">Price per Unit (₦)</Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              step="0.01"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          {/* ELECTRICITY SECTION */}
          <div className="border rounded-xl p-4 space-y-4 stat-card-elec bg-primary/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <Label className="text-sm font-semibold">Electricity</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include_elec"
                  checked={includeElec}
                  onCheckedChange={(v) => setIncludeElec(v as boolean)}
                />
                <Label
                  htmlFor="include_elec"
                  className="text-xs cursor-pointer text-muted-foreground"
                >
                  Include
                </Label>
              </div>
            </div>

            {includeElec && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="elec_prev" className="text-[11px] text-muted-foreground">
                      Previous
                    </Label>
                    <Input
                      id="elec_prev"
                      name="elec_previous_reading"
                      type="number"
                      step="0.01"
                      value={elecPrev}
                      onChange={(e) => setElecPrev(e.target.value)}
                      required={includeElec}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="elec_curr" className="text-[11px] text-muted-foreground">
                      Current
                    </Label>
                    <Input
                      id="elec_curr"
                      name="elec_current_reading"
                      type="number"
                      step="0.01"
                      value={elecCurr}
                      onChange={(e) => setElecCurr(e.target.value)}
                      required={includeElec}
                    />
                  </div>
                </div>

                {elecUnits > 0 && (
                  <div className="bg-primary/5 rounded-lg p-2.5 text-xs flex justify-between items-center border border-primary/10">
                    <span className="text-muted-foreground">{elecUnits.toFixed(2)} units</span>
                    <span className="font-bold text-primary">
                      ₦{elecTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Bill Split</Label>
                  <SplitSelector
                    splitValue={elecSplit}
                    onSplitChange={setElecSplit}
                    selectedTenants={elecTenants}
                    onToggleTenant={(id) =>
                      toggleTenant(id, elecTenants, setElecTenants)
                    }
                    prefix="elec"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="elec_proof" className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Meter Photo
                    <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <Input
                    id="elec_proof"
                    name="elec_proof_image"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PUMPING MACHINE SECTION */}
          <div className="border rounded-xl p-4 space-y-4 stat-card-water bg-blue-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <Label className="text-sm font-semibold">
                  Pumping Machine
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include_pump"
                  checked={includePump}
                  onCheckedChange={(v) => setIncludePump(v as boolean)}
                />
                <Label
                  htmlFor="include_pump"
                  className="text-xs cursor-pointer text-muted-foreground"
                >
                  Include
                </Label>
              </div>
            </div>

            {includePump && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="pump_prev" className="text-[11px] text-muted-foreground">
                      Previous
                    </Label>
                    <Input
                      id="pump_prev"
                      name="pump_previous_reading"
                      type="number"
                      step="0.01"
                      value={pumpPrev}
                      onChange={(e) => setPumpPrev(e.target.value)}
                      required={includePump}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pump_curr" className="text-[11px] text-muted-foreground">
                      Current
                    </Label>
                    <Input
                      id="pump_curr"
                      name="pump_current_reading"
                      type="number"
                      step="0.01"
                      value={pumpCurr}
                      onChange={(e) => setPumpCurr(e.target.value)}
                      required={includePump}
                    />
                  </div>
                </div>

                {pumpUnits > 0 && (
                  <div className="bg-blue-500/5 rounded-lg p-2.5 text-xs flex justify-between items-center border border-blue-500/10">
                    <span className="text-muted-foreground">{pumpUnits.toFixed(2)} units</span>
                    <span className="font-bold text-blue-500">
                      ₦{pumpTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">Bill Split</Label>
                  <SplitSelector
                    splitValue={pumpSplit}
                    onSplitChange={setPumpSplit}
                    selectedTenants={pumpTenants}
                    onToggleTenant={(id) =>
                      toggleTenant(id, pumpTenants, setPumpTenants)
                    }
                    prefix="pump"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pump_proof" className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Meter Photo
                    <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <Input
                    id="pump_proof"
                    name="pump_proof_image"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* COMBINED PREVIEW */}
          {myTotal > 0 && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 space-y-2 animate-fade-in">
              <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" />
                Your Total This Period
              </p>
              {includeElec && elecUnits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-primary" /> Electricity share
                  </span>
                  <span>
                    ₦
                    {myElecShare.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              {includePump && pumpUnits > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Droplets className="h-3 w-3 text-blue-500" /> Pumping share
                  </span>
                  <span>
                    ₦
                    {myPumpShare.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-primary/10 pt-2">
                <span>Total You Owe</span>
                <span className="gradient-text">
                  ₦
                  {myTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={isPending || !canSubmit}
            className="w-full font-medium"
          >
            {isPending ? "Saving..." : "Submit Readings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
