# Custom Admin Dashboard Plan

Replace Sanity Studio with a user-friendly, self-explanatory admin interface built directly into the site.

---

## Overview

**Goal:** Build a complete admin system so team managers can manage all content without learning Sanity Studio.

**URL Structure:**
```
/admin                    → Dashboard (overview, quick actions)
/admin/games              → Game management
/admin/games/[id]         → Edit single game
/admin/games/new          → Create new game
/admin/players            → Player management
/admin/players/[id]       → Edit single player
/admin/players/new        → Add new player
/admin/seasons            → Season management
/admin/practices          → Practice schedule
/admin/fund               → Team fund (expenses ledger)
/admin/stats-entry        → AI stats from photo (ALREADY BUILT)
/admin/settings           → Site settings (team name, logo, socials)
```

**Auth:** Reuse existing team-fund auth system, protect all `/admin/*` routes.

---

## Data Models (from Sanity Schemas)

### 1. Season
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | e.g., "Spring 2025" |
| slug | slug | Yes | Auto-generated from name |
| startDate | date | Yes | |
| endDate | date | Yes | |
| isCurrent | boolean | No | Only one should be true |
| teamFundTotal | number | No | Total dues for season |
| playerPayments | array | No | Player refs + amounts paid |

### 2. Player
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Full name |
| slug | slug | Yes | Auto-generated from name |
| jerseyNumber | number | Yes | 0-99 |
| position | string | Yes | P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH, UTIL |
| photo | image | No | Headshot |
| bio | text | No | Short bio |
| battingSide | string | No | L, R, S |
| throwingSide | string | No | L, R |
| seasons | array | Yes | Which seasons they're on roster |
| isActive | boolean | Yes | Hide if inactive |

### 3. Game
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| season | reference | Yes | Link to season |
| date | datetime | Yes | Game date/time |
| slug | slug | Yes | Auto-generated |
| opponent | string | Yes | Team name |
| location | string | Yes | Field name |
| homeOrAway | string | No | "home" or "away" |
| result | string | No | W, L, T (after game) |
| ourScore | number | No | Final score |
| theirScore | number | No | Final score |
| recap | rich text | No | Game recap (keep in Sanity Studio) |
| gameChangerLink | url | No | External link |
| ourInnings | array[number] | No | Runs per inning |
| theirInnings | array[number] | No | Runs per inning |
| ourHits | number | No | Total hits |
| theirHits | number | No | Total hits |
| ourErrors | number | No | Total errors |
| theirErrors | number | No | Total errors |
| playerStats | array | No | Embedded player stats (use AI tool) |

### 4. Recurring Practice
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| dayOfWeek | string | Yes | 0-6 (Sunday-Saturday) |
| time | string | Yes | e.g., "2:00 PM" |
| location | string | Yes | Field name |
| notes | text | No | Optional notes |
| isActive | boolean | Yes | Toggle on/off |

### 5. Practice (One-off)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| season | reference | Yes | Link to season |
| date | datetime | Yes | Date and time |
| location | string | Yes | Field name |
| notes | text | No | Optional notes |

### 6. Fund Entry
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| date | date | Yes | Transaction date |
| description | string | Yes | What it's for |
| amount | number | Yes | Positive number |
| type | string | Yes | "in" or "out" |

### 7. Site Settings (singleton)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| teamName | string | Yes | e.g., "SD Baseball Club" |
| tagline | string | No | Optional tagline |
| logo | image | No | Team logo |
| defaultGameChangerUrl | url | No | Link to GameChanger |
| contactEmail | email | No | Contact email |
| socialLinks | array | No | Platform + URL pairs |

---

## Implementation Phases

### Phase 1: Foundation
**Files to create:**
- `/src/app/admin/layout.tsx` - Admin layout with sidebar nav
- `/src/middleware.ts` - Extend to protect `/admin/*` routes
- `/src/lib/sanity/mutations.ts` - Helper functions for CRUD operations

**Features:**
- [ ] Admin layout with dark sidebar navigation
- [ ] Password protection (reuse team-fund auth)
- [ ] Dashboard page with quick stats
- [ ] Mobile-responsive design

### Phase 2: Game Management (Most Used)
**Files to create:**
- `/src/app/admin/games/page.tsx` - List all games
- `/src/app/admin/games/[id]/page.tsx` - Edit game
- `/src/app/admin/games/new/page.tsx` - Create game
- `/src/app/api/admin/games/route.ts` - GET (list), POST (create)
- `/src/app/api/admin/games/[id]/route.ts` - GET, PATCH, DELETE

**Features:**
- [ ] List games with filters (season, upcoming/past)
- [ ] Quick score update (just scores, no full form)
- [ ] Create game form (opponent, date, location, home/away)
- [ ] Edit game details
- [ ] Box score entry (innings, hits, errors)
- [ ] Delete game (with confirmation)
- [ ] Link to AI stats entry

### Phase 3: Player Management
**Files to create:**
- `/src/app/admin/players/page.tsx` - List all players
- `/src/app/admin/players/[id]/page.tsx` - Edit player
- `/src/app/admin/players/new/page.tsx` - Add player
- `/src/app/api/admin/players/route.ts` - GET, POST
- `/src/app/api/admin/players/[id]/route.ts` - GET, PATCH, DELETE
- `/src/app/api/admin/upload/route.ts` - Image upload to Sanity

**Features:**
- [ ] List players with jersey numbers
- [ ] Add new player with photo upload
- [ ] Edit player info
- [ ] Manage seasons (which seasons they're on)
- [ ] Toggle active/inactive
- [ ] Delete player (with confirmation)

### Phase 4: Season Management
**Files to create:**
- `/src/app/admin/seasons/page.tsx` - List seasons
- `/src/app/admin/seasons/[id]/page.tsx` - Edit season
- `/src/app/admin/seasons/new/page.tsx` - Create season
- `/src/app/api/admin/seasons/route.ts` - GET, POST
- `/src/app/api/admin/seasons/[id]/route.ts` - GET, PATCH, DELETE

**Features:**
- [ ] List all seasons
- [ ] Create new season
- [ ] Set current season (auto-unset others)
- [ ] Set team fund total
- [ ] Manage player dues/payments
- [ ] Archive old seasons

### Phase 5: Practice Schedule
**Files to create:**
- `/src/app/admin/practices/page.tsx` - Practice management
- `/src/app/api/admin/practices/route.ts` - CRUD for recurring practices
- `/src/app/api/admin/practices/one-off/route.ts` - CRUD for one-off practices

**Features:**
- [ ] Manage recurring weekly practices
- [ ] Add one-off practice dates
- [ ] Toggle practices active/inactive
- [ ] Edit locations and times

### Phase 6: Team Fund
**Files to create:**
- `/src/app/admin/fund/page.tsx` - Fund management
- `/src/app/api/admin/fund/route.ts` - CRUD for fund entries

**Features:**
- [ ] Add money in/out entries
- [ ] Edit/delete entries
- [ ] View running balance
- [ ] (Player payments handled in Season management)

### Phase 7: Site Settings
**Files to create:**
- `/src/app/admin/settings/page.tsx` - Site settings
- `/src/app/api/admin/settings/route.ts` - GET, PATCH

**Features:**
- [ ] Update team name and tagline
- [ ] Upload/change logo
- [ ] Manage social links
- [ ] Update contact email
- [ ] Update GameChanger link

---

## API Route Patterns

All admin API routes follow this pattern:

```typescript
// GET /api/admin/games - List all
// POST /api/admin/games - Create new
// GET /api/admin/games/[id] - Get single
// PATCH /api/admin/games/[id] - Update
// DELETE /api/admin/games/[id] - Delete
```

### Sanity Mutations Helper

```typescript
// src/lib/sanity/mutations.ts

import { writeClient } from "./writeClient";

// Create document
export async function createDocument(type: string, data: object) {
  return writeClient.create({ _type: type, ...data });
}

// Update document
export async function updateDocument(id: string, data: object) {
  return writeClient.patch(id).set(data).commit();
}

// Delete document
export async function deleteDocument(id: string) {
  return writeClient.delete(id);
}

// Upload image
export async function uploadImage(file: File) {
  return writeClient.assets.upload("image", file);
}
```

---

## UI Components Needed

### Shared Components
- `AdminSidebar` - Navigation sidebar
- `AdminHeader` - Top bar with title, actions
- `FormField` - Reusable form field wrapper
- `FormInput` - Text input
- `FormSelect` - Dropdown select
- `FormTextarea` - Multi-line text
- `FormDatePicker` - Date/time picker
- `FormImageUpload` - Image upload with preview
- `ConfirmModal` - Delete confirmation modal
- `Toast` - Success/error notifications
- `DataTable` - Sortable, filterable table
- `EmptyState` - "No items" placeholder
- `LoadingSpinner` - Loading indicator

### Design System
- Reuse existing dark theme (bg-dark, text-white, teal/orange/pink accents)
- Cards: `bg-white/5 border border-white/10`
- Inputs: `bg-white/5 border border-white/20 text-white`
- Primary button: `bg-teal text-dark`
- Danger button: `bg-pink text-white`
- Success states: teal
- Error states: pink
- Warning states: orange

---

## Mobile Considerations

Key mobile use cases:
1. **After a game:** Quick score entry from dugout
2. **At practice:** Mark who showed up
3. **During registration:** Add new player

Priority mobile features:
- Large touch targets
- Simple forms (minimal scrolling)
- Quick actions on dashboard
- Swipe to delete in lists

---

## Image Upload Flow

1. User selects image file
2. Frontend shows preview
3. On form submit:
   - Upload image to Sanity assets API
   - Get back asset reference
   - Include reference in document create/update
4. Display uploaded images using Sanity image URL builder

```typescript
// Upload flow
const asset = await writeClient.assets.upload("image", file);
const imageRef = {
  _type: "image",
  asset: { _type: "reference", _ref: asset._id }
};
```

---

## Security Considerations

1. **Auth:** All `/admin/*` routes protected by middleware
2. **API routes:** Check auth cookie in each route handler
3. **SANITY_API_TOKEN:** Only used server-side, never exposed
4. **Input validation:** Validate all inputs before mutations
5. **Rate limiting:** Consider adding for production

---

## Existing Infrastructure to Reuse

Already built:
- ✅ Auth system (JWT cookies, middleware)
- ✅ Sanity write client
- ✅ AI stats entry page
- ✅ Dark theme styling
- ✅ API route patterns

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Foundation | 2-3 hours | High |
| Phase 2: Games | 4-5 hours | High |
| Phase 3: Players | 4-5 hours | High |
| Phase 4: Seasons | 2-3 hours | Medium |
| Phase 5: Practices | 2-3 hours | Medium |
| Phase 6: Fund | 1-2 hours | Low |
| Phase 7: Settings | 1-2 hours | Low |

**Total: ~18-23 hours**

---

## Getting Started

1. Start with Phase 1 (Foundation)
2. Build out Phase 2 (Games) as it's most frequently used
3. Continue through phases in order

Each phase builds on the previous, so they should be done in sequence.
