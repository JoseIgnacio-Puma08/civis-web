# cIvIs brAnd — Drop store

Production e-commerce site for **Civis Brand**, an independent streetwear label from Quito, Ecuador that sells limited drops of 25 units. Built from scratch and running in production on Vercel: customers browse the current drop, pick a size and check out; the owner runs every drop from an admin panel.

## Features

- **Drop lifecycle:** draft → coming soon (live countdown) → active → sold out, with automatic activation at launch time
- **Checkout** with per-size stock, shipping cost by city and order tracking (pending → paid)
- **Admin panel** (JWT-protected) to manage drops, photos, orders, pre-sales and site config without touching code
- **Community features:** invite codes, waitlist, a public vote to choose an anniversary edition
- **Smooth, animated UI** with GSAP, Motion and Lenis, mobile-first

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Route Handlers), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Neon serverless PostgreSQL (`@neondatabase/serverless`, Drizzle ORM) |
| Validation & auth | Zod · signed HttpOnly cookies with `jose` (HS256 JWT) |
| Hosting | Vercel |

## Project structure

```
app/            Pages and API routes (checkout, drop, admin, /api/*)
components/     UI: active drop, countdown, checkout form, admin modules
lib/            DB client, auth, admin session, constants
db/             SQL schema (9 tables) and migration/ops scripts
```

## Run locally

```bash
npm install
# .env.local → DATABASE_URL=<neon connection string>, AUTH_SECRET=<random string>
psql "$DATABASE_URL" -f db/schema.sql
npm run dev
```

## Author

**José Ignacio Pumagualli** — founder of Civis Brand and the developer of this site · Software Engineering, UDLA · [GitHub](https://github.com/JoseIgnacio-Puma08) · pumaguallipro@gmail.com

Instagram [@civis_brand_](https://instagram.com/civis_brand_) · TikTok [@civisbrand_](https://tiktok.com/@civisbrand_)
