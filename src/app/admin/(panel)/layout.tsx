import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { storeMode } from "@/lib/config";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · JADOS Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-cream lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 p-4 lg:block">
          <Logo compact />
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <AdminNav />
        <div className="hidden space-y-3 p-4 text-sm lg:block">
          <p className="text-muted">
            Signed in as <span className="font-medium text-ink">{admin.name}</span>
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="btn-secondary px-4 py-1.5">Sign out</button>
            </form>
          </div>
          <Link href="/" className="block text-forest underline" target="_blank">
            View store ↗
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        {storeMode() === "demo" && (
          <div className="bg-[#7a4b12] px-4 py-1.5 text-center text-xs text-white">
            STORE_MODE=demo — demo products can be ordered. Set STORE_MODE=live before launch.
          </div>
        )}
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
        <form action={logoutAction} className="p-4 lg:hidden">
          <button className="btn-secondary">Sign out</button>
        </form>
      </div>
    </div>
  );
}
