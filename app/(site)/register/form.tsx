"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterForm({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "दर्ता असफल");
        return;
      }
      if (data.session) {
        toast.success("स्वागत छ! खाता बनाइयो।");
        // Hard reload so server components pick up the new session cookie.
        window.location.assign(next || "/");
      } else {
        toast.success("खाता बनाइयो — अब लग इन गर्नुहोस्।");
        window.location.assign(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="name">नाम</Label>
        <Input id="name" name="name" className="mt-1" autoComplete="name" placeholder="वैकल्पिक" />
      </div>
      <div>
        <Label htmlFor="email">ईमेल</Label>
        <Input id="email" name="email" type="email" required className="mt-1" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">पासवर्ड (कम्तिमा ८ अक्षर)</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1"
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "..." : "खाता बनाउनुहोस्"}
      </Button>
    </form>
  );
}
