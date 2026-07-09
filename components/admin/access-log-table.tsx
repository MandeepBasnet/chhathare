import { Eye, Download } from "lucide-react";
import type { AccessLog } from "@/lib/types";

// Presentational access-log table shared by the admin panel (all works) and the
// author studio (scoped to the author's own works).
export function AccessLogTable({ logs, emptyText }: { logs: AccessLog[]; emptyText: string }) {
  if (logs.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--color-muted)]">
        {emptyText}
      </div>
    );
  }

  return (
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
                {log.userName && <div className="text-xs text-[var(--color-muted)]">{log.userEmail}</div>}
              </td>
              <td className="px-4 py-2.5">{log.bookTitle || log.bookId}</td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mountain-50 px-2.5 py-0.5 text-xs text-mountain-700">
                  {log.action === "download" ? <Download className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {log.action === "download" ? "डाउनलोड" : "हेरियो"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-[var(--color-muted)]">{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
