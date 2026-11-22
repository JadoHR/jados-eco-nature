# JADOS ECO-NATURE INDUSTRIES — Online Store

> *From Nature to Innovation — Creating Value, Preserving Life.*

A mobile-first brand website and online store for **JADOS ECO-NATURE INDUSTRIES**, a Rwanda-based beekeeping and nature-inspired products venture serving Rwanda and East Africa.

It covers the full first-release scope: product catalogue, cart, checkout that creates real **order requests** (no fake payments), order confirmation, WhatsApp contact, and a protected admin dashboard for products, stock, orders and store settings.

---

## Contents

1. [Tech stack](#tech-stack)
2. [Quick start (local)](#quick-start-local)
3. [Environment variables](#environment-variables)
4. [Database](#database)
5. [First admin account](#first-admin-account)
6. [Using the admin](#using-the-admin)
7. [How ordering works](#how-ordering-works)
8. [Customising](#customising)
9. [Testing & quality checks](#testing--quality-checks)
10. [Deployment](#deployment)
11. [Before launch — what the founder must supply](#before-launch--what-the-founder-must-supply)
12. [Integrations that still need accounts or approval](#integrations-that-still-need-accounts-or-approval)
13. [Project structure & data model](#project-structure--data-model)

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript** | Server rendering for SEO, server actions for the admin, one codebase |
| Styling | **Tailwind CSS v4** | Brand colours as CSS variables; light and dark theme |
| Database | **Prisma 6** with **SQLite** locally (**Postgres** in production) | Typed queries, migrations, seed script |
| Validation | **zod** (same schemas on client and server) | |
| Auth | bcrypt-hashed admin passwords + signed, httpOnly session cookie (`jose`) | No third-party account needed |
| Tests | **Vitest** (unit and database integration tests) | |

Money is always stored as **integer minor units** (RWF has no decimals, so 1 unit = 1 franc). Floats are never used for money.

---

## Quick start (local)

Requirements: **Node.js 20.12+** (tested on Node 24) and npm.

```powershell
cd jados-eco-nature
npm install                      # also runs `prisma generate`
copy .env.example .env           # then edit .env (see below) — at minimum set AUTH_SECRET
npx prisma migrate dev           # creates prisma/dev.db and runs the demo seed
npm run admin:create             # creates your admin login (see "First admin account")
npm run dev                      # http://localhost:3000
```

* Store: <http://localhost:3000>
* Admin: <http://localhost:3000/admin>

Generate a strong `AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Environment variables

All variables are listed in [`.env.example`](.env.example). **Never commit `.env`** (it is git-ignored).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` locally; a Postgres URL in production |
| `AUTH_SECRET` | yes | Random string, **32+ characters**, used to sign admin sessions. Changing it signs everyone out |
| `NEXT_PUBLIC_SITE_URL` | yes | Public base URL, e.g. `https://jados.rw`. Used in sitemap, Open Graph and WhatsApp product links |
| `STORE_MODE` | yes | `demo` (demo products can be ordered and a demo banner is shown) or `live` (only real, verified products can be ordered). **Set `live` at launch** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | only for `npm run admin:create` | Remove them after creating the admin |

---

## Database

| Command | What it does |
|---|---|
| `npm run db:migrate` | Create/apply migrations in development (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations in production (`prisma migrate deploy`) |
| `npm run db:seed` | Load demo categories, products, delivery areas and payment options (safe to re-run; never touches orders) |
| `npm run db:reset` | **Deletes all local data**, re-applies migrations and re-seeds |
| `npx prisma studio` | Browse the database in a GUI |

### About the seed (demo) data

Every seeded product is marked **demo** or **concept**:

* **Honey 250 g / 500 g and Beeswax Candle**: *demo listings*. Prices (RWF 5,000 / 9,000 / 7,000), stock and sizes are **placeholders**. They can only be ordered while `STORE_MODE=demo`.
* **Five skincare products**: *concepts*. They are shown as "in development" and **can never be ordered** until you untick "Concept" in the admin, which you should only do after formulation, safety and stability testing, compliant labelling and any required Rwanda regulatory approvals are complete.
* Delivery fees ("Kigali City (demo fee)", etc.) are placeholders.
* Contact phone, WhatsApp, email and address are **empty on purpose**. Nothing has been invented, and the WhatsApp buttons stay hidden until you add a number.
* Product images are **original concept illustrations** (SVG) in `public/images/concept/` and are labelled as such on the site.

---

## First admin account

There is no default password. Create the first admin from the command line:

```powershell
$env:ADMIN_EMAIL="you@yourdomain.com"; $env:ADMIN_PASSWORD="a long passphrase of 12+ characters"; $env:ADMIN_NAME="Your Name"; npm run admin:create
```

(or put `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` in `.env` and run `npm run admin:create`, then delete them from `.env`).

Running the command again with the same email **resets that admin's password**. Passwords are hashed with bcrypt (cost 12). Logins are throttled (5 failed attempts per 15 minutes per email and IP).

> The local development database that came with this project already contains a test admin `admin@jados.test`. Its random password is in your local `.env` only. Do not use it in production.

---

## Using the admin

Go to `/admin` and sign in.

| Page | What you can do |
|---|---|
| **Dashboard** | Total orders, pending orders, order value, admin-verified paid total, low-stock list, recent orders |
| **Orders** | Search and filter by status, **Export CSV**, open an order to change its status (New → Confirmed → Processing → Ready for dispatch → Dispatched → Delivered / Cancelled / Refunded), set payment status, add internal notes, and return stock on cancellation. Every change is logged in the order history |
| **Products** | Create, edit and archive products; quick stock edits; toggle **Featured** (homepage); flags for *Concept* and *Demo*; up to 6 images with alt text |
| **Categories** | Add, rename, reorder and hide categories |
| **Customers** | Customers grouped from orders (phone numbers masked by default) |
| **Messages** | Contact-form messages and newsletter subscribers (with consent date) |
| **Settings** | Store name, currency, phone, **WhatsApp number**, email, address, hours, announcement strip, social links, pickup, **payment methods and instructions**, **delivery areas and fees**, low-stock threshold |

Product images: put files in `public/images/products/` and enter the path (e.g. `/images/products/honey-250.jpg`), or use an `https://` URL. Hosting platforms do not keep uploaded files on the server, so for frequent uploads add an object store (see Integrations).

---

## How ordering works

1. The customer adds items to the cart (stored in the browser's `localStorage`; prices there are display-only).
2. The cart and checkout pages ask the server for a **fresh quote** (`POST /api/cart/quote`): current prices, stock, availability and delivery fee.
3. At checkout the customer enters name, phone, optional email, delivery area and address (or pickup), notes and a payment method you configured.
4. `POST /api/orders` validates everything again on the server, re-reads prices and stock **inside a database transaction**, decrements stock atomically (the last unit can't be sold twice), saves a **snapshot** of names and prices, and creates the order with status `pending_confirmation` and payment `unpaid`.
5. An **idempotency key** makes double-clicks and retries return the same order instead of creating duplicates.
6. The customer sees `/order-confirmation/<reference>?t=<private token>`. Without the correct token nothing is shown, so customers can't see each other's orders.
7. You confirm by phone or WhatsApp, collect payment through your real process, then update the order and payment status in the admin.

**No online payment is taken and no card data is ever collected.** Orders are only marked *paid* by an admin, or in future by a verified payment-provider webhook.

---

## Customising

* **Brand colours**: `src/app/globals.css` (`--forest`, `--botanical`, `--sage`, `--gold`, `--paper`, `--cream`, `--ink`) plus the dark-theme values under `.dark`.
* **Fonts**: `src/app/layout.tsx` (Fraunces for headings, Inter for text).
* **Logo**: replace `public/brand/jados-mark.svg` (square artwork) with the official logo symbol; the wordmark "JADOS ECO-NATURE INDUSTRIES" is text in `src/components/logo.tsx`. The current mark is an original placeholder bee/flower/leaf drawing.
* **Homepage copy**: `src/app/(store)/page.tsx`. **About / Impact / FAQ / policies**: `src/app/(store)/*/page.tsx`.
* **Order statuses**: `src/lib/config.ts`.
* **Announcement, contact details, payment and delivery options**: in the admin under **Settings** (no code changes).
* The hero's honeycomb animation (`src/components/honeycomb-background.tsx`) reacts to the pointer, pauses when off-screen and respects "reduce motion".

---

## Testing & quality checks

```powershell
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Vitest: 31 tests (money, pricing, validation, CSV and order-flow integration)
npm run build       # production build
npm run check       # all of the above
```

The integration tests (`tests/orders.test.ts`) run against a throwaway `prisma/test.db`, never your dev data. They cover server-side price and stock revalidation, price snapshots, idempotency, unique references, the last unit not selling twice, concept products being blocked, whole-order rollback, payment and zone validation, and pickup fees.

Results at hand-over: **typecheck ✓, lint ✓, 31/31 tests ✓, production build ✓**, and the main storefront and admin pages loaded with no browser console errors on the production server.

---

## Deployment

The app needs a Node.js host and a database. Recommended: **Vercel** (hosting) + **Neon**, **Supabase** or **Vercel Postgres** (database). SQLite is only for local development because serverless hosts don't keep files.

**How the two databases fit together**

- `prisma/schema.prisma` (SQLite) is the single source of truth for the data model, used locally and by the tests.
- `prisma/postgres/` holds the generated Postgres copy plus its migrations, used in production. Don't edit it by hand.
- After changing the model, run `npm run db:migrate -- --name <change>` (local SQLite) **and** `npm run db:pg:migration -- <change>` (production Postgres), then commit both. A test fails if you forget the second one.

**Forgot the admin password?**

1. In Vercel, set `ADMIN_EMAIL`, a new `ADMIN_PASSWORD` (12+ characters) and `ADMIN_RESET_PASSWORD=1`.
2. Redeploy, then sign in with the new password.
3. Delete `ADMIN_PASSWORD` and `ADMIN_RESET_PASSWORD` from Vercel again.

**Postgres schema `jados`:** on Postgres the store keeps all its tables in its own schema named `jados`, set in `src/lib/db-url.mjs`. That means it can share a Neon database with other apps without reading or changing their tables. The live site currently uses the existing Neon database `neon-cyan-window`.

**Vercel setup (already wired up in `vercel.json`)**

1. Import the GitHub repo in Vercel (framework: Next.js).
2. **Storage → Create Database → Neon (Postgres)** and connect it to the project. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. Set these environment variables:
   - `AUTH_SECRET`: a long random string.
   - `NEXT_PUBLIC_SITE_URL`: your live URL, for example `https://jados-eco-nature.vercel.app`.
   - `STORE_MODE`: `demo` until you launch.
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: 12+ characters. Only used to create the first admin; remove them after the first deploy.
4. Deploy. `scripts/vercel-build.mjs` runs on every build:
   1. applies Postgres migrations;
   2. seeds demo data **only into an empty database**;
   3. creates the first admin if it doesn't exist yet (it never resets an existing password);
   4. builds the site.
5. Every `git push` to `main` redeploys automatically.
6. At launch:
   1. replace the demo products with real ones;
   2. set `STORE_MODE=live`;
   3. optionally add your own domain in Vercel → Domains.

### Pushing to GitHub

```powershell
git init
git add .
git commit -m "JADOS ECO-NATURE store — first release"
gh repo create jados-eco-nature --public --source . --push
```

`.gitignore` already excludes `.env`, `*.db` and `node_modules`. Check `git status` before the first commit.

> GitHub Pages only hosts static files, so it can't run this store (it needs a server and a database). Use GitHub for the code and Vercel (or any Node host) to run it.

---

## Before launch — what the founder must supply

**Brand**
- [ ] Final logo file (transparent PNG/SVG) to replace `public/brand/jados-mark.svg`
- [ ] Official business email, phone and WhatsApp number (Admin → Settings)
- [ ] Social media links, business address and opening hours
- [ ] Registered business name and registration details for the policies

**Products** (replace every demo listing)
- [ ] Which products are genuinely ready to sell
- [ ] Real product photos, names, sizes / net weights and prices in RWF
- [ ] Ingredient / material lists, allergen and safety information, usage and storage instructions
- [ ] Origin (JADOS hives vs. partner beekeepers), batch information, SKUs and stock levels
- [ ] Any valid certifications and approvals, with documents
- [ ] For skincare: completed formulation, safety and stability testing, compliant labels and Rwanda regulatory approvals **before** unticking "Concept"
- [ ] "Made in Rwanda" wording only where it can be substantiated

**Operations**
- [ ] Delivery areas, fees and realistic delivery times (Admin → Settings)
- [ ] Pickup location and times
- [ ] Payment methods you can actually accept, with instructions
- [ ] Returns, refunds and cancellation rules (fill in the `[To be completed]` parts of `/shipping-returns`)
- [ ] Who receives and fulfils orders, and how customers are contacted

**Legal**
- [ ] Legal review of `/privacy`, `/terms` and `/shipping-returns` (including Rwanda's Law N° 058/2021 on personal data protection, and consumer-protection rules)
- [ ] Product labelling, tax / VAT and consumer-protection obligations checked

**Switch-over**
- [ ] Set `STORE_MODE=live`, remove or replace all demo and concept products, and delete the demo delivery fees

---

## Integrations that still need accounts or approval

| Integration | Status | Notes |
|---|---|---|
| Domain name | needed | e.g. a `.rw` domain from a Rwandan registrar |
| Hosting (Vercel or similar) | needed | Free tier is fine to start |
| Postgres database (Neon, Supabase, Vercel Postgres) | needed | Set `DATABASE_URL` |
| Online payments (Mobile Money / card gateway) | **not integrated** | Needs merchant onboarding with a provider operating in Rwanda (e.g. MTN MoMo, Airtel Money or an aggregator). Add it as a server-side integration with credentials in environment variables, and mark orders paid **only** from a verified webhook |
| Order notifications (email / SMS / WhatsApp Business API) | not integrated | Needs an email sender (e.g. Resend, Postmark) or SMS / WhatsApp Business provider account |
| WhatsApp click-to-chat | ready | Just enter the number in Admin → Settings |
| Image uploads (object storage) | not integrated | Images currently use paths or URLs; add Vercel Blob, S3 or Cloudinary for uploads from the admin |
| Analytics | not integrated | If added, ask for cookie consent first and update the privacy policy |

---

## Project structure & data model

```
prisma/
  schema.prisma        data model (AdminUser, Category, Product, ProductImage, DeliveryZone,
                       Order, OrderItem, StoreSettings, NewsletterSubscriber, ContactMessage, AuditLog)
  migrations/          SQL migrations
  seed.ts              demo seed data (clearly marked)
scripts/create-admin.ts
src/
  app/(store)/         public pages: / shop category product cart checkout order-confirmation
                       about our-impact contact faq shipping-returns privacy terms
  app/admin/           login + protected panel (dashboard, orders, products, categories,
                       customers, messages, settings) and server actions (actions.ts)
  app/api/             cart quote, orders, contact, newsletter
  components/          header, footer, cart context, product cards, forms, honeycomb hero
  lib/                 money, pricing, orders, validation, auth, settings, catalog, csv, whatsapp
  middleware.ts        blocks /admin for anyone not signed in
tests/                 Vitest unit and integration tests
public/                brand mark and concept illustrations
```

**Security notes**: every admin page, server action and the CSV export checks the session on the server (`requireAdmin()`), not only the middleware. All inputs are validated with zod on the server. Prisma uses parameterised queries. CSV export neutralises formula injection. Customer data is not written to logs. Admin pages send `noindex`.
