"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "./cart/cart-context";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/category/honey", label: "Honey" },
  { href: "/category/beeswax-candles", label: "Candles" },
  { href: "/category/skincare", label: "Skincare" },
  { href: "/about", label: "Our Story" },
  { href: "/our-impact", label: "Impact" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => setOpen(false), [pathname]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  const isActive = (href: string) => pathname === href || (href !== "/shop" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="container-page flex h-16 items-center gap-3 sm:h-18">
        <Logo />

        <nav aria-label="Main" className="ml-4 hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-forest/10 ${
                isActive(item.href) ? "text-forest underline decoration-gold decoration-2 underline-offset-8" : "text-ink/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form onSubmit={search} role="search" className="relative hidden sm:block">
            <label htmlFor="header-search" className="sr-only">
              Search products
            </label>
            <input
              id="header-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="input w-44 rounded-full py-2 pl-9 xl:w-52"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </form>

          <ThemeToggle />

          <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-forest hover:bg-forest/10" aria-label={`Cart, ${ready ? count : 0} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 7h12l-1 13H7L6 7z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.7rem] font-bold text-[#1d2a20]">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-forest hover:bg-forest/10 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-paper xl:hidden">
          <div className="container-page py-4">
            <form onSubmit={search} role="search" className="mb-3">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input id="mobile-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="input rounded-full" />
            </form>
            <nav aria-label="Mobile" className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-forest/10"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/faq" className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-forest/10">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
