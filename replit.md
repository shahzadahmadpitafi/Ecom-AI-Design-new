# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Full-stack e-commerce + AI design platform for **Signitive Enterprises** — a premium custom apparel manufacturer from Sialkot, Pakistan.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Signitive Enterprises — Platform

### Brand
- **Colors**: Background `#0a0a0a`, Primary Gold `#C9A84C`, Secondary text `#A0A0A0`
- **Fonts**: Bebas Neue (display/headlines via `--font-display`), Inter (body)
- **Style**: Sharp corners (border-radius: 0), glass-morphism cards (`.glass-card`)
- **WhatsApp**: +923114661392
- **Alibaba**: signitiveenterprises.trustpass.alibaba.com

### Artifacts

| Artifact | Port | Path | Description |
|---|---|---|---|
| `signitive` (frontend) | 22006 | `/` | React + Vite frontend |
| `api-server` | 8080 | `/api` | Express API server |

### Pages (frontend)
- `/` — Homepage with hero, featured products, how-it-works, testimonials
- `/studio` — AI Design Studio with live canvas preview (3-panel layout)
- `/catalog` — Product grid with sidebar filters (category, fabric, MOQ)
- `/quote` — Bulk quote engine with tier discounts + contact form
- `/account` — Saved designs gallery + quick actions sidebar
- `/contact` — About Signitive + contact form + Alibaba/WhatsApp CTAs

### API Routes
- `GET /api/products` — List all products (with filters)
- `GET /api/products/featured` — Featured products
- `GET /api/products/:id` — Single product
- `GET /api/catalog/summary` — Stats (total products, categories, countries served)
- `GET /api/catalog/categories` — Category list with counts
- `GET /api/catalog/featured` — Featured products
- `GET /api/designs` — List saved designs
- `POST /api/designs` — Create design
- `GET /api/designs/:id` — Single design
- `DELETE /api/designs/:id` — Delete design
- `POST /api/quotes/calculate` — Calculate bulk pricing with tiers
- `POST /api/quotes` — Submit quote request

### Database Schema (PostgreSQL)
- `products` — 23 products across 5 categories (Streetwear, Fitness Wear, Caps, Sports Wear, Motocross)
- `designs` — Saved design configurations with prompt and product reference
- `quote_requests` — Quote submissions with tier pricing, status tracking

### Tiered Pricing Discounts
- 1-49 units: base price
- 50-99 units: 10% off
- 100-199 units: 20% off
- 200+ units: 25% off + custom pricing

### Important Notes
- All API routes must call `.map(serializeDates)` before Zod parsing because Drizzle returns `Date` objects but Zod schemas expect ISO strings
- Navbar and Layout use `@/components/ui/` path alias (not relative `./`)
- MOQ filter defaults to "all" (not empty string, which breaks `<SelectItem>`)
