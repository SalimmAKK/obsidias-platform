# src/legacy

Pre-Next.js originals moved here as-is during the repo restructure. They predate the
App Router port and are **not wired into the app** (nothing imports them):

- `Landing.tsx` / `Landing.css` — uses `react-router-dom`, which is not a dependency
  of this project. The live version is `src/components/Landing.tsx`.
- `ReviewQueue.tsx` / `ReviewQueue.css` — standalone version. The live version is
  `src/app/review/page.tsx` (+ `ReviewQueue.css` in that folder), already wired to
  `AppLayout` and the App Router.
- `approvals/page.tsx` / `approvals/StatusBadge.tsx` — retired as part of the product
  direction decision to rebuild the dashboard around the WhatsApp/Instagram/BANT
  lead-gen model instead of the spreadsheet-upload/property-matching flow. This was
  the `/approvals` route and its status-pill component (`Awaiting Approval` / `Sent` /
  `Rejected` / `Processing` / `No Matches` vocabulary), removed from `src/app` and the
  sidebar nav. The lead-gen equivalents are `LeadStatusBadge` / `BucketBadge` in
  `src/components/LeadBadges.tsx`, used by `/leads`, `/leads/[id]`, and `/dashboard`.

Kept for reference only. Not part of the build graph.
