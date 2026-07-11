import Link from "next/link";
import { NavLinks } from "@/components/layout/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Life OS
        </Link>
      </div>
      <NavLinks />
    </aside>
  );
}
