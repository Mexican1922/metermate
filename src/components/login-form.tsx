"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { login, signup, forgotPassword } from "@/app/login/actions";
import { MeterMateLogo } from "@/components/logo";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const success = searchParams.get("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div className={className} {...props}>
      <Card className="glass border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-primary animate-pulse-glow rounded-xl">
              <MeterMateLogo size={44} />
            </div>
          </div>
          <CardTitle className="text-2xl font-display font-bold gradient-text">
            MeterMate
          </CardTitle>
          <CardDescription className="text-xs">
            {showForgot
              ? "Enter your email for a password reset link."
              : "Login or create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="text-sm font-medium text-green-600 bg-green-500/10 p-3 rounded-lg mb-4 flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}
          {/* ERROR MESSAGE */}
          {message && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg mb-4 flex items-center gap-2">
              <span>⚠️</span> {message}
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {showForgot ? (
            <form className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email" className="text-sm">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button
                type="submit"
                formAction={forgotPassword}
                className="w-full font-medium"
              >
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setShowForgot(false)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Back to Login
              </Button>
            </form>
          ) : (
            /* LOGIN / SIGNUP FORM */
            <form className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button type="submit" formAction={login} className="w-full font-medium">
                  Login
                </Button>
                <Button
                  variant="outline"
                  type="submit"
                  formAction={signup}
                  className="w-full font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                >
                  Sign Up
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
