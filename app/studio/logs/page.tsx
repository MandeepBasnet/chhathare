import { requireAuthor } from "@/lib/appwrite/auth-helpers";
import { listBooks, listAccessLogsForBooks } from "@/lib/appwrite/data";
import { AccessLogTable } from "@/components/admin/access-log-table";

export const metadata = { title: "पहुँच अभिलेख" };

// Author-scoped readership: logs only for the works this author owns.
export default async function StudioLogsPage() {
  const { author } = await requireAuthor();
  const { items } = await listBooks({ authorId: author.$id, status: "all", limit: 200 });
  const logs = await listAccessLogsForBooks(
    items.map((b) => b.$id),
    300,
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">पहुँच अभिलेख</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        तपाईंका रचनाहरू कसले कहिले पढे — नवीनतम माथि।
      </p>
      <AccessLogTable logs={logs} emptyText="तपाईंका रचनाहरूको अहिलेसम्म कुनै पहुँच अभिलेख छैन।" />
    </div>
  );
}
