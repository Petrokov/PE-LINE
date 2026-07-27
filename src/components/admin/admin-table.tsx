import type { ReactNode } from "react";

interface AdminTableProps {
  headers: string[];
  children: ReactNode;
}

export function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <table className="w-full bg-white border border-line rounded-[10px] overflow-hidden text-sm">
      <thead className="bg-bg text-muted text-xs uppercase">
        <tr>
          {headers.map((h, i) => (
            <th
              key={h || i}
              className={`p-3 ${i === headers.length - 1 ? "" : "text-left"}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
