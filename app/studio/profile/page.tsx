import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { toPlain } from "@/lib/utils";
import { AuthorForm } from "@/components/admin/author-form";

export const metadata = { title: "मेरो परिचय" };

export default async function StudioProfile() {
  const { author } = await requireAuthor();
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-1 text-2xl font-bold sm:text-3xl">मेरो परिचय</h1>
      <p className="mb-6 text-sm text-[var(--color-muted)]">तपाईंको सार्वजनिक सर्जक पृष्ठमा देखिने विवरण।</p>
      <AuthorForm mode="author" author={toPlain(author)} />
    </div>
  );
}
