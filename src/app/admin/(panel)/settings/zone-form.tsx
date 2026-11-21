"use client";

import { useActionState } from "react";
import { saveZoneAction, type ActionState } from "../../actions";
import { keepValuesSubmit } from "@/components/admin/use-keep-values";

type Zone = { id: string; name: string; fee: string; eta: string; active: boolean; sortOrder: number };

export function ZoneForm({ zone }: { zone?: Zone }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveZoneAction, {});
  const p = zone?.id ?? "new";
  return (
    <form action={action} onSubmit={zone ? keepValuesSubmit(action) : undefined} className="card grid gap-3 p-4 sm:grid-cols-[1.4fr_7rem_1fr_4.5rem_auto] sm:items-end">
      {zone && <input type="hidden" name="id" value={zone.id} />}
      <div>
        <label className="label" htmlFor={`zn-${p}`}>Area name</label>
        <input id={`zn-${p}`} name="name" className="input" defaultValue={zone?.name} required />
      </div>
      <div>
        <label className="label" htmlFor={`zf-${p}`}>Fee</label>
        <input id={`zf-${p}`} name="fee" inputMode="decimal" className="input" defaultValue={zone?.fee ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor={`ze-${p}`}>Estimated time</label>
        <input id={`ze-${p}`} name="eta" className="input" defaultValue={zone?.eta} />
      </div>
      <div>
        <label className="label" htmlFor={`zo-${p}`}>Order</label>
        <input id={`zo-${p}`} name="sortOrder" type="number" min={0} className="input" defaultValue={zone?.sortOrder ?? 10} />
      </div>
      <div className="flex items-center gap-3 pb-1">
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={zone?.active ?? true} className="h-4 w-4" /> Active
        </label>
        <button className="btn-primary px-4 py-2" disabled={pending}>{zone ? "Save" : "Add"}</button>
      </div>
      {(state.error || state.message) && (
        <p role="status" className={`text-xs sm:col-span-5 ${state.error ? "text-red-700" : "text-botanical"}`}>{state.error ?? state.message}</p>
      )}
    </form>
  );
}
