"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Admin-only: provision (or show) the login account linked to an author record.
export function AuthorAccount({
  authorId,
  linkedEmail,
}: {
  authorId: string;
  linkedEmail: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/authors/${authorId}/account`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "लगइन बनाउन असफल");
        return;
      }
      toast.success("लगइन बनाइयो — सर्जकलाई ईमेल/पासवर्ड दिनुहोस्");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (linkedEmail) {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4">
        <div className="mb-1 flex items-center gap-2 font-medium">
          <KeyRound className="h-4 w-4 text-mountain-600" /> लगइन खाता
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> {linkedEmail} — यो सर्जक /studio मा लग इन गर्न सक्छन्।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[var(--border)] p-4">
      <div className="mb-2 flex items-center gap-2 font-medium">
        <KeyRound className="h-4 w-4 text-mountain-600" /> लगइन खाता बनाउनुहोस्
      </div>
      <p className="mb-3 text-sm text-[var(--color-muted)]">
        यो सर्जकलाई आफ्ना रचनाहरू थप्न/सम्पादन गर्न लगइन दिनुहोस्।
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="acc-email">ईमेल</Label>
          <Input id="acc-email" name="email" type="email" required className="mt-1" autoComplete="off" />
        </div>
        <div>
          <Label htmlFor="acc-pass">पासवर्ड (कम्तिमा ८)</Label>
          <Input id="acc-pass" name="password" type="text" required minLength={8} className="mt-1" autoComplete="off" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="mt-3">
        {pending ? "..." : "लगइन बनाउनुहोस्"}
      </Button>
    </form>
  );
}
