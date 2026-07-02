"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, EyeOff } from "lucide-react";

// Toggles a book between draft and published from the admin list.
export function PublishButton({ bookId, status }: { bookId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const publish = status !== "published";

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: publish ? "published" : "draft" }),
      });
      if (res.ok) {
        toast.success(publish ? "प्रकाशित भयो" : "लुकाइयो");
        router.refresh();
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error(e.error || "असफल");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={publish ? "प्रकाशित गर्नुहोस्" : "लुकाउनुहोस्"}
      className={
        "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs disabled:opacity-50 " +
        (publish
          ? "border-green-300 text-green-700 hover:bg-green-50"
          : "border-[var(--border)] text-[var(--color-muted)] hover:bg-mountain-50")
      }
    >
      {publish ? <CheckCircle2 className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {publish ? "प्रकाशित" : "लुकाउनुहोस्"}
    </button>
  );
}
