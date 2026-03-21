"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHouse, joinHouse } from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Home, Users } from "lucide-react";
import { MeterMateLogo } from "@/components/logo";

function SetupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="w-full max-w-sm animate-slide-up">
      {/* Branding */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-primary animate-pulse-glow rounded-xl mb-3">
          <MeterMateLogo size={48} />
        </div>
        <h1 className="text-xl font-display font-bold gradient-text">MeterMate</h1>
        <p className="text-xs text-muted-foreground mt-1">Set up your house to get started</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4 text-center flex items-center justify-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="create" className="text-sm">Create House</TabsTrigger>
          <TabsTrigger value="join" className="text-sm">Join House</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">
                    Create Your House
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Set up a new space for your tenants.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={createHouse} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="house_name" className="text-sm">House / Compound Name</Label>
                  <Input
                    id="house_name"
                    name="house_name"
                    placeholder="e.g. Peace Lodge"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant_name" className="text-sm">Your Name</Label>
                  <Input
                    id="tenant_name"
                    name="tenant_name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <Button type="submit" className="w-full font-medium">
                  Create House
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-display">
                    Join a House
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ask your admin for the House ID.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={joinHouse} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="house_id" className="text-sm">House ID</Label>
                  <Input
                    id="house_id"
                    name="house_id"
                    placeholder="Paste ID here"
                    required
                    className="font-mono text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tenant_name" className="text-sm">Your Name</Label>
                  <Input
                    id="tenant_name"
                    name="tenant_name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <Button type="submit" className="w-full font-medium">
                  Join House
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-ambient bg-grid-pattern pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-center text-sm text-muted-foreground py-10">
            Loading...
          </div>
        }
      >
        <SetupForm />
      </Suspense>
    </div>
  );
}
