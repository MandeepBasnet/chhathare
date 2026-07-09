import { Eye, Download } from "lucide-react";
import { listAccessLogs } from "@/lib/appwrite/data";

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

      {logs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
          अहिलेसम्म कुनै अभिलेख छैन।
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--card)] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-2.5 font-medium">मिति</th>
                <th className="px-4 py-2.5 font-medium">पाठक</th>
                <th className="px-4 py-2.5 font-medium">रचना</th>
                <th className="px-4 py-2.5 font-medium">कार्य</th>
                <th className="px-4 py-2.5 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.$id} className="border-b border-[var(--border)] last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-[var(--color-muted)]">
                    {new Date(log.$createdAt).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{log.userName || log.userEmail}</div>
                    {log.userName && (
                      <div className="text-xs text-[var(--color-muted)]">{log.userEmail}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">{log.bookTitle || log.bookId}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mountain-50 px-2.5 py-0.5 text-xs text-mountain-700">
                      {log.action === "download" ? (
                        <Download className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                      {log.action === "download" ? "डाउनलोड" : "हेरियो"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-[var(--color-muted)]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
