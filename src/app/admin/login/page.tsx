import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card w-full max-w-sm p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl text-forest">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Authorised staff only.</p>
        <LoginForm />
      </div>
    </div>
  );
}
