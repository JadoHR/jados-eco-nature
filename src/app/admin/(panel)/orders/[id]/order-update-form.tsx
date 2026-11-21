"use client";

import { useActionState, useState } from "react";
import { updateOrderAction, type ActionState } from "../../../actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import { keepValuesSubmit } from "@/components/admin/use-keep-values";

export function OrderUpdateForm({ order }: { order: { id: string; status: string; paymentStatus: string; internalNotes: string } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateOrderAction, {});
  const [status, setStatus] = useState(order.status);
  const [payment, setPayment] = useState(order.paymentStatus);
  const cancelling = (status === "cancelled" || status === "refunded") && order.status !== "cancelled" && order.status !== "refunded";

  return (
    <form action={action} onSubmit={keepValuesSubmit(action)} className="card h-fit space-y-4 p-5">
      <input type="hidden" name="id" value={order.id} />
      <h2 className="font-semibold text-forest">Update order</h2>
      <div>
        <label htmlFor="status" className="label">Order status</label>
        <select id="status" name="status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      {cancelling && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="restock" defaultChecked className="mt-0.5 h-4 w-4" />
          Return the items to stock
        </label>
      )}
      <div>
        <label htmlFor="paymentStatus" className="label">Payment status</label>
        <select id="paymentStatus" name="paymentStatus" className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
          {PAYMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {payment === "paid" && order.paymentStatus !== "paid" && (
          <p className="mt-1 text-xs text-[#7a5a0c] dark:text-gold">Only mark as paid after you have verified the money was received.</p>
        )}
      </div>
      <div>
        <label htmlFor="internalNotes" className="label">Internal notes <span className="font-normal text-muted">(never shown to the customer)</span></label>
        <textarea id="internalNotes" name="internalNotes" rows={4} className="input" defaultValue={order.internalNotes} maxLength={4000} />
      </div>
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
      <p role="status" aria-live="polite" className={`text-sm ${state.error ? "text-red-700" : "text-botanical"}`}>{state.error ?? state.message}</p>
    </form>
  );
}
