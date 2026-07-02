"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "लग इन असफल");
        return;
      }
      toast.success("स्वागत छ!");
      // Hard reload so server components re-read the newly set session cookie;
      // /dashboard routes to /admin or /studio by role.
      window.location.assign(next || "/dashboard");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="email">ईमेल</Label>
        <Input id="email" name="email" type="email" required className="mt-1" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">पासवर्ड</Label>
        <Input id="password" name="password" type="password" required className="mt-1" autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "..." : "लग इन गर्नुहोस्"}
      </Button>
    </form>
  );
}
