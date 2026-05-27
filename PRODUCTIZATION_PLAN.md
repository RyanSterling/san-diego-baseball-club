# Multi-Tenant Baseball Club Platform

> Saved for later - focus on single site first, revisit when ready.

## The Vision

Transform this into a SaaS where any baseball team gets their own site at `teamname.baseballclub.com`.

---

## Architecture (High Level)

```
Request: chicago.baseballclub.com/roster
   ↓
Middleware extracts "chicago" from subdomain
   ↓
Fetches Chicago's config from Sanity (colors, logo, name)
   ↓
Renders their site with their theme
```

---

## Key Changes

| Area | Current | Multi-Tenant |
|------|---------|--------------|
| Routing | Single site | Subdomain-based |
| Data | All in one bucket | Filtered by tenant |
| Colors | Hardcoded CSS | CSS variables per tenant |
| Logo | `/public/SDBC_LOGO.png` | Sanity image per tenant |
| Auth | Env var password | Password in Sanity per tenant |

---

## New Sanity Schema: Tenant

```typescript
{
  name: "tenant",
  fields: [
    { name: "teamName", type: "string" },
    { name: "subdomain", type: "string" },      // "chicago"
    { name: "abbreviation", type: "string" },   // "CBC"
    { name: "logo", type: "image" },
    { name: "theme", type: "object", fields: [
      { name: "primaryColor", type: "string" },   // hex
      { name: "secondaryColor", type: "string" },
      { name: "accentColor", type: "string" },
    ]},
    { name: "teamFundPassword", type: "string" },
    { name: "contactEmail", type: "string" },
  ]
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `sanity/schemas/tenant.ts` | Tenant config schema |
| `src/lib/tenant/getTenant.ts` | Read tenant from request |
| `src/middleware.ts` | Subdomain parsing |

## Files to Modify

| File | Change |
|------|--------|
| `globals.css` | Hardcoded colors → CSS variables |
| `layout.tsx` | Inject theme, dynamic metadata |
| `sanity/schemas/*.ts` | Add tenant reference field |
| `lib/sanity/queries.ts` | Filter all queries by tenant |
| `components/schedule/GameCard.tsx` | Replace "SDBC" with dynamic |

---

## Color Refactor

~84 references to `teal`, `orange`, `pink` need to become:

```css
/* Before */
bg-teal text-orange

/* After */
bg-primary text-secondary
```

With CSS variables:
```css
:root {
  --color-primary: var(--tenant-primary, #9BD4D1);
  --color-secondary: var(--tenant-secondary, #E68528);
}
```

---

## Estimated Effort

| Phase | Time |
|-------|------|
| Tenant foundation + middleware | 1 week |
| Data migration (add tenant refs) | 3-4 days |
| Color/theme system | 1 week |
| Auth + assets | 1 week |
| Studio setup | 3-4 days |
| **Subtotal: Multi-tenant** | **~4 weeks** |

### If Adding Full SaaS (Clerk + Stripe)

| Phase | Time |
|-------|------|
| Clerk integration | 1-2 weeks |
| Stripe billing | 2-3 weeks |
| Admin dashboard | 1-2 weeks |
| **Subtotal: SaaS layer** | **4-7 weeks** |

**Total for full SaaS: 8-12 weeks**

---

## When Ready

1. Finish the San Diego site
2. Decide on pricing model
3. Line up 1-2 pilot teams
4. Build multi-tenant foundation
5. Add Clerk + Stripe
6. Launch
