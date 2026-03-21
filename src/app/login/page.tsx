import { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login - MeterMate",
  description:
    "Login to manage your shared electricity and pumping machine bills.",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-ambient bg-grid-pattern pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-primary/3 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        <Suspense
          fallback={
            <div className="text-center text-sm text-muted-foreground py-10">
              Loading...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
