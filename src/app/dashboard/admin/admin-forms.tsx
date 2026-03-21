"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { addTenant } from "./actions";

export function AddTenantForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addTenant(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Tenant added successfully!");
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-base">Add Tenant Manually</CardTitle>
            <CardDescription className="text-xs">
              Add someone without a MeterMate account for bill splits.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-600 bg-green-500/10 p-3 rounded-lg flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground">Tenant Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            💡 They can later join using your House ID and their account will automatically link.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
