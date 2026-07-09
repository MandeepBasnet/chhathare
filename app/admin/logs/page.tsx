import { listAccessLogs } from "@/lib/appwrite/data";
import { AccessLogTable } from "@/components/admin/access-log-table";

export const metadata = { title: "पहुँच अभिलेख" };

// Admin research: who opened which protected content, when, and from where.
export default async function AccessLogsPage() {
  const logs = await listAccessLogs(300);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold sm:text-3xl">पहुँच अभिलेख</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        कसले कुन रचना कहिले खोल्यो — कपिराइट अनुसन्धानका लागि। नवीनतम माथि।
      </p>
      <AccessLogTable logs={logs} emptyText="अहिलेसम्म कुनै अभिलेख छैन।" />
    </div>
  );
}
