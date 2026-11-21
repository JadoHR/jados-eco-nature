"use client";

import { useActionState, useState } from "react";
import { saveProductAction, type ActionState } from "../../actions";
import { keepValuesSubmit } from "@/components/admin/use-keep-values";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  price: string;
  size: string;
  ingredients: string;
  directions: string;
  warnings: string;
  storage: string;
  stockQuantity: number;
  status: string;
  isConcept: boolean;
  isDemo: boolean;
  featured: boolean;
  images: { url: string; alt: string }[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export function ProductForm({ product, categories, currency }: { product?: Product; categories: { id: string; name: string }[]; currency: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProductAction, {});
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const images = [...(product?.images ?? []), ...Array.from({ length: 4 }, () => ({ url: "", alt: "" }))].slice(0, Math.max(4, (product?.images.length ?? 0) + 1));
  const f = state.fields ?? {};
  const err = (k: string) => f[k] && <p className="field-error">{f[k]}</p>;

  return (
    <form action={action} onSubmit={keepValuesSubmit(action)} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="font-semibold text-forest sm:col-span-2">Basics</h2>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="input" defaultValue={product?.name} required onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))} />
          {err("name")}
        </div>
        <div>
          <label className="label" htmlFor="slug">URL slug *</label>
          <input id="slug" name="slug" className="input font-mono" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} required />
          {err("slug")}
        </div>
        <div>
          <label className="label" htmlFor="sku">SKU *</label>
          <input id="sku" name="sku" className="input font-mono" defaultValue={product?.sku} required />
          {err("sku")}
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Category *</label>
          <select id="categoryId" name="categoryId" className="input" defaultValue={product?.categoryId ?? categories[0]?.id}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {err("categoryId")}
        </div>
        <div>
          <label className="label" htmlFor="size">Size / variant</label>
          <input id="size" name="size" className="input" defaultValue={product?.size} placeholder="e.g. 250 g" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="shortDescription">Short description *</label>
          <input id="shortDescription" name="shortDescription" className="input" defaultValue={product?.shortDescription} maxLength={240} required />
          {err("shortDescription")}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Full description *</label>
          <textarea id="description" name="description" rows={5} className="input" defaultValue={product?.description} required />
          {err("description")}
        </div>
      </section>

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <h2 className="font-semibold text-forest sm:col-span-3">Price, stock &amp; visibility</h2>
        <div>
          <label className="label" htmlFor="price">Price ({currency}) *</label>
          <input id="price" name="price" inputMode="decimal" className="input" defaultValue={product?.price ?? ""} placeholder="5000" required />
          {err("priceMinor")}
        </div>
        <div>
          <label className="label" htmlFor="stockQuantity">Stock quantity *</label>
          <input id="stockQuantity" name="stockQuantity" type="number" min={0} className="input" defaultValue={product?.stockQuantity ?? 0} required />
          {err("stockQuantity")}
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="input" defaultValue={product?.status ?? "draft"}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
            <option value="archived">Archived (hidden)</option>
          </select>
        </div>
        <fieldset className="space-y-2 sm:col-span-3">
          <legend className="sr-only">Flags</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="isConcept" defaultChecked={product?.isConcept ?? false} className="mt-0.5 h-4 w-4" />
            <span><strong>Concept product</strong> — shown for interest only, can never be ordered (use until formulation, safety, labelling &amp; approvals are complete).</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="isDemo" defaultChecked={product?.isDemo ?? false} className="mt-0.5 h-4 w-4" />
            <span><strong>Demo listing</strong> — placeholder data. Can only be ordered while STORE_MODE=demo. Untick once all details are real and verified.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="mt-0.5 h-4 w-4" />
            <span><strong>Featured</strong> on the homepage</span>
          </label>
        </fieldset>
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="font-semibold text-forest">Product information</h2>
        <p className="text-sm text-muted">Only enter verified information. No medical claims, “chemical-free” or unverified certifications.</p>
        {[
          ["ingredients", "Ingredients / materials", product?.ingredients],
          ["directions", "Directions for use", product?.directions],
          ["warnings", "Warnings / allergens", product?.warnings],
          ["storage", "Storage instructions", product?.storage],
        ].map(([name, label, value]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>{label}</label>
            <textarea id={name} name={name} rows={2} className="input" defaultValue={value ?? ""} />
          </div>
        ))}
      </section>

      <section className="card grid gap-4 p-6">
        <h2 className="font-semibold text-forest">Images</h2>
        <p className="text-sm text-muted">
          Use a path to a file in <code>/public</code> (e.g. <code>/images/products/honey-250.jpg</code>) or an <code>https://</code> URL.
          Alt text describes the image for screen readers. The first image is the main one.
        </p>
        {images.map((img, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor={`imageUrl${i}`}>Image {i + 1} URL</label>
              <input id={`imageUrl${i}`} name={`imageUrl${i}`} className="input font-mono text-xs" defaultValue={img.url} />
              {err(`images.${i}.url`)}
            </div>
            <div>
              <label className="label" htmlFor={`imageAlt${i}`}>Image {i + 1} alt text</label>
              <input id={`imageAlt${i}`} name={`imageAlt${i}`} className="input" defaultValue={img.alt} />
              {err(`images.${i}.alt`)}
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-0 flex items-center gap-4 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button type="submit" className="btn-primary h-11 px-8" disabled={pending}>{pending ? "Saving…" : "Save product"}</button>
        <p role="status" aria-live="polite" className={`text-sm ${state.error ? "text-red-700 dark:text-red-300" : "text-botanical"}`}>
          {state.error ?? state.message}
        </p>
      </div>
    </form>
  );
}
