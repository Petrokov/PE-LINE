import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  { href: "/admin/categories", label: "Kategorije" },
  { href: "/admin/products", label: "Proizvodi" },
  { href: "/admin/team", label: "Tim" },
  { href: "/admin/downloads", label: "Preuzimanja" },
  { href: "/admin/gallery", label: "Galerija" },
  { href: "/admin/settings", label: "Postavke" },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-line p-5 flex flex-col">
      <p className="text-sm font-bold text-ink mb-6">PE-LINE Admin</p>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-[8px] text-sm text-muted hover:bg-bg hover:text-ink transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-muted mb-2 truncate">{userEmail}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="w-full text-sm text-left px-3 py-2 rounded-[8px] hover:bg-bg text-muted cursor-pointer"
        >
          Odjava
        </button>
      </form>
    </aside>
  );
}
