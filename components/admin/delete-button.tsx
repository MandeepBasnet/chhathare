"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

// Generic admin delete button. Calls DELETE on `endpoint` after confirm.
export function DeleteButton({
  endpoint,
  confirmText,
  size = "icon",
}: {
  endpoint: string;
  confirmText: string;
  size?: "icon" | "text";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(confirmText)) return;
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        toast.success("मेटाइयो");
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "मेटाउन असफल");
      }
    } catch {
      toast.error("त्रुटि भयो");
    } finally {
      setLoading(false);
    }
  }

  if (size === "text") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" /> मेटाउनुहोस्
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label="मेटाउनुहोस्"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
