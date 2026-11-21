"use client";

import { useActionState } from "react";
import { saveCategoryAction, type ActionState } from "../../actions";
import { keepValuesSubmit } from "@/components/admin/use-keep-values";

type Category = { id: string; name: string; slug: string; description: string; sortOrder: number; active: boolean };

export function CategoryForm({ category, productCount }: { category?: Category; productCount?: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveCategoryAction, {});
  const p = category?.id ?? "new";
  const f = state.fields ?? {};
  return (
    <form action={action} onSubmit={category ? keepValuesSubmit(action) : undefined} className="card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_5rem_auto] sm:items-end">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div>
        <label className="label" htmlFor={`n-${p}`}>Name</label>
        <input id={`n-${p}`} name="name" className="input" defaultValue={category?.name} required />
        {f.name && <p className="field-error">{f.name}</p>}
      </div>
      <div>
        <label className="label" htmlFor={`s-${p}`}>Slug</label>
        <input id={`s-${p}`} name="slug" className="input font-mono" defaultValue={category?.slug} required />
        {f.slug && <p className="field-error">{f.slug}</p>}
      </div>
      <div>
        <label className="label" htmlFor={`o-${p}`}>Order</label>
        <input id={`o-${p}`} name="sortOrder" type="number" min={0} className="input" defaultValue={category?.sortOrder ?? 10} />
      </div>
      <div className="flex items-center gap-3 pb-1">
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="h-4 w-4" /> Active
        </label>
        <button className="btn-primary px-4 py-2" disabled={pending}>{category ? "Save" : "Add"}</button>
      </div>
      <div className="sm:col-span-4">
        <label className="label" htmlFor={`d-${p}`}>Description</label>
        <input id={`d-${p}`} name="description" className="input" defaultValue={category?.description} />
      </div>
      <p className="text-xs text-muted sm:col-span-4" role="status">
        {productCount !== undefined && `${productCount} product(s). `}
        <span className={state.error ? "text-red-700" : "text-botanical"}>{state.error ?? state.message}</span>
      </p>
    </form>
  );
}
