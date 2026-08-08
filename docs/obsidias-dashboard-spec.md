# Obsidias — Real Estate Automation Dashboard
## UI & Design Specification v1.0

---

## Brand Identity

**Platform name:** Obsidias  
**Tagline:** *Automate. Match. Close.*  
**Sub-brand:** Obsidias Services — Real Estate Division  
**Aesthetic direction:** Obsidian Edition — Glass Morphism. Deep dark greens, electric purple. Premium. Sharp. No decoration for decoration's sake.

---

## Core Brand Palette

Inherits from the Obsidias Services design system.

| Token | Value |
| :--- | :--- |
| `--brand-primary` | `#7C3AED` |
| `--brand-bg` | `#000F08` |
| `--brand-accent` | `#7C3AED` |
| `--foreground` | `#FFFFFF` |
| `--card-bg` | `#001A0E` |
| `--muted` | `#002213` |
| `--muted-text` | `rgba(255, 255, 255, 0.4)` |
| `--border` | `rgba(124, 58, 237, 0.1)` |
| `--input-bg` | `rgba(124, 58, 237, 0.05)` |
| `--success` | `#1D9E75` |
| `--error` | `#D85A30` |
| `--warning` | `#BA7517` |

---

## Design Language

### Glass Panel — Standard
```
background:       rgba(0, 26, 14, 0.6)
backdrop-filter:  blur(24px) saturate(180%)
border:           1px solid rgba(255, 255, 255, 0.08)
box-shadow:       0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.06)
border-radius:    16px
```

### Glass Panel — Heavy (modals, primary cards)
```
background:       rgba(0, 15, 8, 0.8)
backdrop-filter:  blur(40px) saturate(200%)
border:           1px solid rgba(124, 58, 237, 0.15)
box-shadow:       0 24px 64px rgba(0, 0, 0, 0.6),
                  inset 0 1px 0 rgba(255, 255, 255, 0.08),
                  0 0 0 1px rgba(124, 58, 237, 0.05)
border-radius:    20px
```

### Global Background
```
background-color: #000F08
background-image: radial-gradient(ellipse at 0% 0%, rgba(124, 58, 237, 0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 100% 100%, rgba(124, 58, 237, 0.04) 0%, transparent 60%)
```
Fixed. Does not scroll.

### Typography
```
Display / Headings:   'Syne', sans-serif — weight 700-800. Tight tracking (-0.03em).
Body / UI:            'DM Sans', sans-serif — weight 400-500. Clean, neutral.
Mono / Data:          'JetBrains Mono', monospace — used for IDs, numbers, status codes.
```
Load via Google Fonts. Apply `-webkit-font-smoothing: antialiased` globally.

---

## Page Architecture

```
/                   → Landing page (Grainient background, slogan, CTA)
/login              → Auth page (login + signup tabs)
/dashboard          → Main dashboard (file upload, pipeline status)
/approvals          → Pending approval jobs
/leads              → CRM leads table
/settings           → Agency and channel configuration
```

All routes except `/` and `/login` require authentication. Redirect unauthenticated users to `/login`.

---

## Page 01 — Landing Page (`/`)

### Layout
Full viewport. Vertically and horizontally centered content. No header. No navigation.

### Background
Grainient WebGL animated gradient component covering the full viewport.  
Colors: `#7C3AED`, `#001A0E`, `#000F08`  
Warp frequency: 2.5. Noise speed: 0.4. Subtle, slow movement.  
Grain overlay on top: `opacity: 0.12`, `filter: url(#noise)`.

### Content Block (centered, max-width 560px)
```
1. Wordmark
   "OBSIDIAS" — Syne 800, 13px letter-spacing 0.3em, color: rgba(255,255,255,0.5)
   Scanline animation passes over it on load (one pass, not looping).

2. Tagline
   "Automate. Match. Close."
   Syne 700, 52px, color: #FFFFFF, letter-spacing: -0.03em
   Line height: 1.1. Centered.
   Animate in: fade up from 20px, duration 1.2s, ease expo.out, delay 0.3s.

3. Sub-tagline
   "AI-powered lead matching and proposal automation for real estate agencies."
   DM Sans 400, 16px, color: rgba(255,255,255,0.5), line-height: 1.6
   Animate in: fade up, delay 0.5s.

4. CTA Button — premium-button variant
   Label: "Enter Platform"
   Syne 600, 13px, letter-spacing: 0.12em, text-transform: uppercase
   Padding: 14px 36px. Border-radius: 8px.
   Default state: Glass Panel Standard. Border: 1px solid rgba(124,58,237,0.3).
   Hover: box-shadow: 0 0 60px rgba(124,58,237,0.4), border-color: rgba(124,58,237,0.7)
   Animated background fill on hover (left to right, 300ms).
   Background fill color: rgba(124,58,237,0.15)
   Animate in: fade up, delay 0.7s.
   On click: navigate to /login with a fade-out transition (200ms).
```

### Footer line
Bottom of viewport. Centered.  
"© 2025 Obsidias Services" — DM Sans 400, 12px, `--muted-text`.

---

## Page 02 — Auth Page (`/login`)

### Layout
Full viewport. Background same as Landing (fixed Grainient, slower movement).  
Single card centered. Max-width: 420px.

### Auth Card — Glass Panel Heavy
```
Padding: 40px
Contains: wordmark (small), tab switcher, form fields, submit button, divider, OAuth (optional)
```

### Wordmark (top of card)
"OBSIDIAS" — Syne 700, 11px, letter-spacing: 0.3em, `--muted-text`. Centered.

### Tab Switcher
Two tabs: "Sign In" / "Create Account"  
Full-width tabs inside the card. Active tab: `color: #FFFFFF`, bottom border `2px solid #7C3AED`.  
Inactive: `--muted-text`. Transition: 200ms.

---

### Sign In Form

**Fields:**
```
Email Address
  Input — type: email, placeholder: "you@agency.com"

Password
  Input — type: password, placeholder: "••••••••"
  Inline toggle: show/hide password (eye icon, 16px, --muted-text)
```

**Forgot password**  
Right-aligned below password field. "Forgot password?" — DM Sans 400, 12px, `#7C3AED`. Underline on hover.

**Submit Button**  
Label: "Sign In" — full width, premium-button variant, height: 48px.

**Error state**  
Inline below submit: small red text + icon. "Invalid email or password." — DM Sans 400, 13px, `--error`.

---

### Create Account Form

**Fields:**
```
Full Name
  Input — type: text, placeholder: "Mohammed Al-Rashid"

Agency Name
  Input — type: text, placeholder: "Al-Rashid Real Estate"

Email Address
  Input — type: email

Password
  Input — type: password
  Below: password strength bar (4 segments, fills left to right, colors: error → warning → success)

Confirm Password
  Input — type: password
```

**Submit Button**  
Label: "Create Account" — full width, premium-button variant, height: 48px.

**Terms line**  
Below button. Centered. DM Sans 400, 11px, `--muted-text`.  
"By creating an account you agree to our Terms of Service."

---

### Input Field Spec (all forms)
```
background:       var(--input-bg)
border:           1px solid rgba(124, 58, 237, 0.15)
border-radius:    8px
padding:          12px 16px
color:            #FFFFFF
font:             DM Sans 400, 14px
height:           48px

Focus state:
  border-color:   rgba(124, 58, 237, 0.5)
  box-shadow:     0 0 0 3px rgba(124, 58, 237, 0.08)
  outline:        none

Placeholder:
  color:          rgba(255,255,255,0.25)
```

---

## Global Navigation (authenticated pages)

### Sidebar — left-fixed, width: 240px
```
background:       rgba(0, 15, 8, 0.95)
backdrop-filter:  blur(20px)
border-right:     1px solid rgba(124, 58, 237, 0.08)
height:           100vh. Fixed.
padding:          24px 0
```

**Top section**
```
Wordmark: "OBSIDIAS" Syne 700 12px letter-spacing 0.3em, --muted-text. Padding: 0 24px 32px.
```

**Nav items**
```
Each item: padding 10px 24px. Border-radius: 8px (inner). Full-width.
Font: DM Sans 500, 14px.
Icon: 16px, left of label, gap: 12px.

Active:
  background:     rgba(124, 58, 237, 0.1)
  color:          #FFFFFF
  border-left:    2px solid #7C3AED (flush with sidebar edge)

Inactive:
  color:          --muted-text
  Hover: color #FFFFFF, background rgba(255,255,255,0.04)
```

**Nav items list:**
```
Dashboard        (icon: grid-2x2)
Approvals        (icon: check-circle) — badge showing pending count
Leads            (icon: users)
Settings         (icon: sliders)
```

**Bottom section (pinned to bottom)**
```
Agency name:  DM Sans 500 13px #FFFFFF. Truncate overflow.
Agent email:  DM Sans 400 12px --muted-text.
Sign Out:     DM Sans 400 13px --muted-text. Hover: --error. Icon: log-out 14px.
Padding: 24px.
Border-top: 1px solid rgba(124,58,237,0.08)
```

### Main content area
```
margin-left:  240px
padding:      40px 48px
min-height:   100vh
```

### Page header (top of each main content area)
```
Page title:   Syne 700, 24px, #FFFFFF
Subtitle:     DM Sans 400, 14px, --muted-text
margin-bottom: 32px
```

---

## Page 03 — Dashboard (`/dashboard`)

### Layout
Two-column grid: left (wider, ~65%) for upload + pipeline, right (~35%) for stats.  
On screens < 1200px: single column stack.

---

### Section A — Upload Zone (left column, top)

**Card — Glass Panel Standard**
```
padding:        40px
border:         1px dashed rgba(124, 58, 237, 0.2)
border-radius:  16px
text-align:     center
cursor:         pointer
```

**Idle state**
```
Icon:           Upload cloud icon, 32px, rgba(124,58,237,0.6). Float animation (8s loop).
Heading:        "Drop your sheet here" — Syne 600, 18px, #FFFFFF
Sub:            "Supports .xlsx, .csv, .ods — Tab 1: Leads, Tab 2: Properties" — DM Sans 400, 13px, --muted-text
Button:         "Browse Files" — secondary style (border only, no fill). Below the sub-text.
```

**Drag-over state**
```
border-color:   rgba(124, 58, 237, 0.6)
background:     rgba(124, 58, 237, 0.05)
box-shadow:     0 0 40px rgba(124, 58, 237, 0.1) inset
Icon color:     #7C3AED (full opacity)
Heading:        "Release to upload"
```

**Uploading state**
```
Replace content with:
  Circular progress indicator (stroke: #7C3AED, track: rgba(124,58,237,0.1), 48px diameter)
  Filename below: DM Sans 500, 14px, #FFFFFF
  "Parsing sheet..." — DM Sans 400, 13px, --muted-text
  Scanline animation passes over the card during this state.
```

**Success state**
```
Icon:           Check circle, 32px, --success
Heading:        "Sheet processed" — Syne 600, 18px, #FFFFFF
Sub:            "12 leads found · 38 properties loaded" (dynamic) — DM Sans 400, 13px, --muted-text
Button:         "Upload another" — secondary style
Auto-transition to pipeline status below after 1.5s.
```

**Error state**
```
Icon:           Alert circle, 32px, --error
Heading:        "Upload failed" — Syne 600, 18px, #FFFFFF
Sub:            Error message from API — DM Sans 400, 13px, --error
Button:         "Try again"
```

---

### Section B — Pipeline Status (left column, below upload)

Appears after a sheet is processed. Hidden otherwise.

**Card — Glass Panel Standard. Title: "Pipeline"**

Live processing table. One row per lead.

```
Columns:
  Lead name       DM Sans 500, 14px, #FFFFFF
  Budget          JetBrains Mono 400, 13px, --muted-text  (e.g. "1,500,000 SAR")
  Location        DM Sans 400, 13px, --muted-text
  Status          Pill badge (see below)
  Action          Icon button — eye icon to view matches (opens modal)

Row hover: background rgba(255,255,255,0.02)
Row separator: 1px solid rgba(124,58,237,0.06)
```

**Status badges:**
```
Processing:     background rgba(186,117,23,0.15), color #BA7517,  text "Matching..."
Awaiting:       background rgba(124,58,237,0.15), color #A78BFA,  text "Awaiting Approval"
Sent:           background rgba(29,158,117,0.15), color #1D9E75,  text "Sent"
Rejected:       background rgba(216,90,48,0.15),  color #D85A30,  text "Rejected"
Error:          background rgba(216,90,48,0.1),   color #D85A30,  text "Error"

All badges: DM Sans 500, 11px, letter-spacing 0.04em, padding 4px 10px, border-radius 20px
```

---

### Section C — Stats Panel (right column)

Four stat cards stacked vertically. Each card — Glass Panel Standard.

```
Card structure:
  Top: label — DM Sans 500, 11px, letter-spacing 0.08em, text-transform uppercase, --muted-text
  Middle: value — Syne 700, 32px, #FFFFFF
  Bottom: delta or sub-label — DM Sans 400, 12px

Stat 01:  "Total Leads"       value: dynamic integer
Stat 02:  "Pending Approval"  value: dynamic integer. Sub: "--error" color if > 0
Stat 03:  "Proposals Sent"    value: dynamic integer. Sub: "--success" color
Stat 04:  "Match Rate"        value: dynamic percentage (sent / total × 100). Sub: "this session"
```

---

## Page 04 — Approvals (`/approvals`)

### Layout
Single column. Full width table.

### Filter bar (above table)
```
Left:  "Pending Approvals" — Syne 700, 20px (page section title)
Right: Filter tabs — All / Pending / Sent / Rejected (Tabs component)
```

### Approvals Table — Glass Panel Standard (full width)

```
Columns:
  Lead           Name + email stacked. DM Sans 500 14px + 12px --muted-text
  Budget         JetBrains Mono 13px
  Location       DM Sans 13px
  Top Match      Property title + match score pill. DM Sans 14px.
  Submitted      Relative time (e.g. "3 min ago") — DM Sans 12px --muted-text
  Status         Pill badge (same spec as pipeline table)
  Actions        Two icon buttons: Eye (view), Check (approve), X (reject)
                 Only shown when status is "Awaiting Approval"

Empty state (no rows):
  Centered inside table body.
  Icon: inbox, 32px, rgba(124,58,237,0.3)
  Text: "No approvals yet" Syne 600 16px #FFFFFF
  Sub:  "Uploaded leads will appear here." DM Sans 13px --muted-text
```

### Lead Detail Modal (triggered by Eye icon)

Glass Panel Heavy. Max-width: 680px. Centered overlay. Backdrop: rgba(0,0,0,0.7).

```
Header:
  Lead name — Syne 700, 20px
  Close button (X) top right

Body — two sections:

  Section 1: Lead Info
    Grid 2×3: Name, Email, Phone, Budget, Location, Property Type
    Label: DM Sans 500 11px uppercase --muted-text
    Value: DM Sans 400 14px #FFFFFF

  Section 2: Matched Properties (3 cards in a row)
    Each property card — Glass Panel Standard, smaller padding
      Property title — Syne 600 14px
      Location, price, beds/baths — DM Sans 13px --muted-text
      Match score — large pill, color mapped to score:
        80–100: --success
        60–79:  #A78BFA
        <60:    --warning
      Match reason — DM Sans 400 12px, --muted-text, italic

Footer:
  "Reject" button — secondary/ghost style, --error border on hover
  "Approve & Send" button — premium-button, full purple glow
  Both full width on mobile, side by side on desktop
```

---

## Page 05 — Leads (`/leads`)

CRM log of all processed leads.

### Filter & search bar
```
Left:  Search input — "Search by name, email, location..." — full glass input style
Right: Status filter dropdown (All / Proposal Sent / Rejected / No Matches / Error)
       Export button — secondary style, icon: download
```

### Leads Table — Glass Panel Standard (full width)

```
Columns:
  Name           DM Sans 500 14px
  Contact        Email + phone stacked, 12px --muted-text
  Budget         JetBrains Mono 13px
  Location       DM Sans 13px
  Properties     Count pill (e.g. "3 matched")
  Status         Pill badge
  Date           DM Sans 12px --muted-text. Format: "15 Jan 2025"

Pagination:
  Bottom of table. DM Sans 400 13px.
  "← Previous" / "Next →" — ghost buttons.
  "Page 1 of 4" centered.
```

---

## Page 06 — Settings (`/settings`)

### Layout
Single column. Max-width: 720px. Sections separated by `<Separator>` component.

### Section 01 — Agency Profile
```
Fields:
  Agency Name     Input
  Agent Name      Input
  Agent Email     Input
  Agent Phone     Input

Save button: "Save Changes" — premium-button, right-aligned.
```

### Section 02 — Approval Channel
```
Label: "Approval Channel"
Sub:   "Choose how you receive lead approval requests."

Two option cards side by side:
  WhatsApp card:
    Icon: WhatsApp logo, 24px, #25D366
    Title: "WhatsApp" — Syne 600 15px
    Sub:   "Via Meta Cloud API" — DM Sans 12px --muted-text
    Selected state: border rgba(124,58,237,0.5), background rgba(124,58,237,0.08)

  Telegram card:
    Icon: Telegram logo, 24px, #2AABEE
    Title: "Telegram" — Syne 600 15px
    Sub:   "Via Bot API" — DM Sans 12px --muted-text

Below selected card: input for phone number / chat ID depending on selection.
Save button: right-aligned.
```

### Section 03 — Danger Zone
```
Card — border: 1px solid rgba(216,90,48,0.2). Background: rgba(216,90,48,0.03).
Label: "Danger Zone" — Syne 600 15px, --error
Action: "Delete all leads" — ghost button, --error color, confirmation modal required.
```

---

## Shared Components

### Toast Notifications
```
Position: bottom-right. Stack upward. Max 3 visible.
Glass Panel Standard. Min-width: 300px. Padding: 14px 18px.
Border-left: 3px solid (--success / --error / --warning depending on type)
Icon + message text side by side.
Auto-dismiss: 4s. Slide in from right, fade out.
```

### Confirmation Modal
```
Glass Panel Heavy. Max-width: 400px. Centered overlay.
Title: Syne 700 18px
Body:  DM Sans 400 14px --muted-text
Buttons: "Cancel" (ghost) + "Confirm" (premium-button, --error background for destructive)
```

### Loading Skeleton
```
Used while fetching table data.
Rows of rounded rectangles: background rgba(255,255,255,0.04)
Shimmer animation: linear-gradient sweep left to right, 1.5s loop.
```

---

## Animation Reference

| Name | Spec |
| :--- | :--- |
| Float | 8s infinite. translateY(0) → translateY(-5px) → translateY(0). ease-in-out. |
| Scanline | 4s linear. 2px line, rgba(124,58,237,0.15). Top → bottom. One-shot on trigger. |
| GSAP Reveal | duration 1.2s, ease expo.out, trigger 85% viewport, 40px directional offset. |
| Shimmer | 1.5s linear infinite. Skeleton loading sweep. |
| Hover glow | 300ms. box-shadow 0 0 60px rgba(124,58,237,0.4). |
| Badge pulse | Pending badges only. 2s infinite. opacity 1 → 0.6 → 1. |

---

## Responsive Breakpoints

| Breakpoint | Behavior |
| :--- | :--- |
| `> 1200px` | Full two-column dashboard layout. Sidebar visible. |
| `768–1200px` | Single column. Sidebar collapses to icon-only (48px wide). |
| `< 768px` | Sidebar becomes bottom tab bar. All cards full width. Tables scroll horizontally. |

---

## Accessibility

- All interactive elements: `focus-visible` ring using `rgba(124,58,237,0.5)`
- Minimum contrast: 4.5:1 for body text against card backgrounds
- All icons accompanied by `aria-label` or visible text
- Modal traps focus. ESC closes.
- Skeleton loaders include `aria-busy="true"` on the container

---

## Asset Checklist

| Asset | Spec |
| :--- | :--- |
| Favicon | Dark green circle `#001A0E`, white "O" Syne 800. 32×32px SVG. |
| OG Image | 1200×630. Grainient background. Wordmark + tagline centered. |
| Logo (wordmark) | "OBSIDIAS" Syne 800, white. Export SVG. |
