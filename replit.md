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

### Brand — "Cyberpunk Gold" Design System
- **Colors**: Background `#0a0a0a`, Gold `#C9A84C`, Purple `#a78bfa`, Cyan `#22d3ee`, Secondary `#A0A0A0`, WhatsApp `#25d366`, Alibaba `#FF6A00`
- **Fonts**: Bebas Neue (display/headlines via `--font-display`), Inter (body)
- **Style**: Sharp corners (border-radius: 0), gold grid background, scan line overlays, purple/gold glows, no glass-morphism
- **WhatsApp**: +923114661392
- **Alibaba**: signitiveenterprises.trustpass.alibaba.com
- **CSS animations**: `animate-purple-border`, `animate-scanline`, `animate-pulse-glow`, `animate-cursor`, `animate-float`, `animate-marquee`
- **Shared UI**: `GoldGrid`, `ScanLine`, `PurpleGlow`, `GoldGlow`, `LiveBadge`, `GoldDivider`, `CountUp`, `ScrollToTop` (all in `src/components/ui/`)

### Artifacts

| Artifact | Port | Path | Description |
|---|---|---|---|
| `signitive` (frontend) | 22006 | `/` | React + Vite frontend |
| `api-server` | 8080 | `/api` | Express API server |

### Pages (frontend)
- `/` — Homepage: hero + animated stat counters + ticker marquee + AI Studio showcase + 8-category grid + best sellers + 5-step manufacturing timeline + trust signals + testimonials + free sample CTA + footer
- `/studio` — AI Design Studio with live canvas preview (3-panel layout)
- `/catalog` — Product grid with search, category/fabric/MOQ/price/customizable filters, 61 products across 8 categories
- `/quote` — Bulk quote engine with 4 tier cards, MOQ progress bar, savings summary, production timeline, WhatsApp pre-fill button
- `/about` — Company story, manufacturing capabilities, factory gallery, international buyers section, certifications
- `/account` — Saved designs gallery + quick actions sidebar
- `/contact` — Contact form + Alibaba/WhatsApp CTAs
- `/track` — **Public** order tracking page: customer enters order # (SE-YYYY-NNNN) + optional WhatsApp for verification; shows production timeline with 10 stages
- `/admin/login` — Admin login (email+password → Bearer token stored in localStorage)
- `/admin` — Admin dashboard: stats cards, 30-day revenue chart (Recharts), recent orders table
- `/admin/orders` — Orders list with filters, status dropdown, WhatsApp templates, CSV export
- `/admin/orders/:id` — Order detail: customer info, order items, production timeline, payment panel, WhatsApp templates
- `/admin/customers` — Customer CRUD with type filters (retail/wholesale/international/vip)
- `/admin/production` — Kanban board + list view of active orders by production status; drag-to-move between columns
- `/admin/payments` — Payment overview; pending payments list with WhatsApp reminder links; payment history across all orders
- `/admin/analytics` — Full analytics with Recharts charts: daily/monthly revenue, category breakdown, orders by status, top customers, country distribution

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
- `POST /api/seed-products` — (Dev only) Seed all 61 products into the database
- `GET /api/track/:orderNumber` — **Public** order tracking (no auth); optional `?whatsapp=` param for verification

### Admin API Routes (all under `/api/admin/*`, Bearer token auth)
- `POST /api/admin/auth/login` — Login → returns Bearer token
- `POST /api/admin/auth/setup` — First-time admin setup (setup secret: "signitive-setup-2025")
- `GET /api/admin/auth/me` — Get current admin info
- `POST /api/admin/auth/logout` — Invalidate token
- `GET /api/admin/orders` — List orders (filters: status, paymentStatus, search)
- `POST /api/admin/orders` — Create order (creates production stages automatically)
- `GET /api/admin/orders/:id` — Order detail with items, stages, payments
- `PUT /api/admin/orders/:id` — Update order fields
- `POST /api/admin/orders/:id/status` — Update order status + create notification
- `POST /api/admin/orders/:id/payment` — Record payment → updates balance + paymentStatus
- `PUT /api/admin/production/:orderId/stage` — Complete/update a production stage
- `GET /api/admin/orders-export` — CSV export of all orders
- `GET /api/admin/customers` — List customers
- `POST /api/admin/customers` — Create customer
- `GET /api/admin/customers/:id` — Customer with order history
- `PUT /api/admin/customers/:id` — Update customer
- `GET /api/admin/production` — Active orders with production stages (for Kanban)
- `GET /api/admin/analytics/dashboard` — Stats + chart data + recent orders
- `GET /api/admin/analytics/full` — Full analytics (category revenue, orders by status, top customers, country distribution, monthly revenue)
- `GET /api/admin/notifications` — Notification list + unread count
- `PUT /api/admin/notifications/:id/read` — Mark notification read
- `POST /api/admin/notifications/read-all` — Mark all notifications read

### Database Schema (PostgreSQL)
- `products` — 61 products across 8 categories (Streetwear, Fitness Wear, Sports Uniforms, Sports Goods, Team Wear, Boxing, Motocross, Caps). Has `availableSizes` (text[]) and `isCustomizable` (boolean) fields.
- `designs` — Saved design configurations with prompt and product reference
- `quote_requests` — Quote submissions with tier pricing, status tracking
- `customers` — Customer CRM: name, email, whatsapp, country, city, companyName, customerType (retail/wholesale/international/vip), totalOrders, totalSpentPkr, notes
- `orders` — Orders: orderNumber (SE-YYYY-NNNN), customerId, status, items (JSON), totalPkr, advancePaidPkr, balanceDuePkr, paymentStatus (unpaid/partial/paid), designImageUrl, estimatedDelivery, trackingNumber
- `order_items` — Line items per order: productName, category, garmentColor, garmentSize, fabric, gsm, quantity, unitPricePkr, totalPricePkr, brandLabel
- `production_stages` — 10 stages per order: order_received → design_approved → sampling → sample_approved → cutting → stitching → printing → quality_check → packing → dispatched; each has status (pending/in_progress/completed), notes, completedAt
- `payments` — Payment records: orderId, amountPkr, paymentMethod, referenceNumber, status, receivedAt
- `notifications` — In-app notifications: type, title, message, orderId, isRead
- `admin_users` — Admin accounts: name, email, passwordHash (bcrypt), role

### Admin Auth
- Auth method: Bearer token stored in `localStorage["admin_token"]`; user info in `localStorage["admin_user"]`
- Token is an in-memory 64-char hex token (server restarts invalidate tokens)
- `adminFetch()` in `src/lib/admin-api.ts` auto-redirects to `/admin/login` on 401
- Default admin: admin@signitive.com / Admin@2025 (created via setup endpoint)

### Tiered Pricing Discounts
- 1-49 units: base price
- 50-99 units: 10% off
- 100-199 units: 20% off
- 200+ units: 25% off + custom pricing

### Important Notes
- All API routes must call `.map(serializeDates)` before Zod parsing because Drizzle returns `Date` objects but Zod schemas expect ISO strings
- Navbar and Layout use `@/components/ui/` path alias (not relative `./`)
- MOQ filter defaults to "all" (not empty string, which breaks `<SelectItem>`)
