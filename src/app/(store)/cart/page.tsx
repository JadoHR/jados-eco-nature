import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="heading-display text-4xl sm:text-5xl">Your cart</h1>
      <CartView />
    </div>
  );
}
