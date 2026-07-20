// Publishing rules shared by every write path — the admin create/update routes,
// the quick publish toggle, and the form's client-side check. RC-1 (English being
// rejected because one validator was never updated) is the reason these live in
// one place instead of being restated per route.

export type BookStatusInput = "draft" | "published";

// The routes treat anything that isn't an explicit "draft" as published; keep
// that single interpretation here so the check and the stored value agree.
export function normalizeStatus(status: unknown): BookStatusInput {
  return status === "draft" ? "draft" : "published";
}

// A work must carry a publication year before it goes public. Drafts may be
// incomplete — an author saving a work-in-progress shouldn't have to look the
// year up first. Priority is deliberately NOT required: it defaults to 0, which
// is a meaningful ordering value, not a missing one.
export function publishBlockedReason(
  status: BookStatusInput,
  publishedYear: unknown,
): string | null {
  if (status !== "published") return null;
  const year = typeof publishedYear === "string" ? publishedYear.trim() : publishedYear;
  if (!year) return "प्रकाशित गर्न प्रकाशन वर्ष चाहिन्छ";
  return null;
}
