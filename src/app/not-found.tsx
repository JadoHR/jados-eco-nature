import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="heading-display mt-3 text-4xl">This page has flown away</h1>
        <p className="mt-3 text-muted">We could not find the page you were looking for.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/shop" className="btn-secondary">Shop products</Link>
        </div>
      </div>
    </div>
  );
}
