# CLAUDE.md — Collected PWA

## Project Overview

**Collected** is a PWA for parents (and couples) to create, track, and reflect on daily "collection moments" — intentional connection rituals rooted in Gordon Neufeld's attachment framework from *Hold On to Your Kids*. A Mastra AI agent helps users generate personalized collection moments based on their child's age, interests, and current family challenges.

The core principle is **connection before direction** — every feature should reinforce the idea that attachment is something you practice daily, not a state you achieve.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **AI Agent**: Mastra (latest, `@mastra/core`, `@mastra/ai-sdk`)
- **LLM Provider**: OpenRouter (`@openrouter/ai-sdk-provider`)
- **Default Model**: `anthropic/claude-sonnet-4-5` (configurable via `OPENROUTER_MODEL` env var)
- **Database**: LibSQL (local SQLite via `@mastra/libsql`) for Mastra storage + memory
- **Auth**: NextAuth.js v5 (email magic link or Google OAuth)
- **PWA**: `next-pwa` for service worker, manifest, offline support
- **UI**: Tailwind CSS + AI SDK UI + AI Elements for the chat coach interface
- **State**: React Server Components + Server Actions for data mutations

## Directory Structure

```
collected/
├── CLAUDE.md                        # ← You are here
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout, PWA manifest link, fonts
│   │   ├── page.tsx                 # Landing / marketing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Authenticated shell with bottom nav
│   │   │   ├── today/page.tsx       # Daily check-in view (primary screen)
│   │   │   ├── week/page.tsx        # Week heatmap + streak view
│   │   │   ├── coach/page.tsx       # AI Collection Coach chat
│   │   │   ├── moments/page.tsx     # Manage collection moments
│   │   │   └── settings/page.tsx    # Profile, child profiles, preferences
│   │   └── api/
│   │       ├── chat/route.ts        # AI Coach streaming endpoint (Mastra)
│   │       └── auth/[...nextauth]/route.ts
│   ├── mastra/
│   │   ├── index.ts                 # Mastra instance config
│   │   ├── agents/
│   │   │   └── collection-coach.ts  # The AI collection coach agent
│   │   └── tools/
│   │       ├── suggest-moments.ts   # Generates personalized moments
│   │       ├── assess-progress.ts   # Analyzes collection patterns
│   │       └── adapt-moments.ts     # Adjusts moments based on feedback
│   ├── lib/
│   │   ├── db.ts                    # Database client (Drizzle + LibSQL)
│   │   ├── schema.ts               # Drizzle schema definitions
│   │   ├── actions/                 # Server Actions
│   │   │   ├── moments.ts          # CRUD for collection moments
│   │   │   ├── logs.ts             # Check-in / log mutations
│   │   │   └── profiles.ts         # Child profile mutations
│   │   └── utils.ts                # Date helpers, streak calc, etc.
│   ├── components/
│   │   ├── ui/                      # Shared design system components
│   │   ├── today/                   # Today view components
│   │   ├── week/                    # Week heatmap components
│   │   ├── coach/                   # AI coach chat components
│   │   └── ai-elements/            # AI SDK Elements (installed via CLI)
│   └── styles/
│       └── globals.css              # Tailwind + custom CSS vars
├── public/
│   ├── manifest.json                # PWA manifest
│   ├── sw.js                        # Service worker (generated)
│   ├── icons/                       # App icons (192, 512)
│   └── fonts/                       # Self-hosted Playfair Display + DM Sans
├── drizzle/
│   └── migrations/                  # Database migrations
├── package.json
├── tsconfig.json                    # ES2022 module + bundler resolution (Mastra requirement)
├── next.config.ts
├── tailwind.config.ts
└── .env.local                       # ANTHROPIC_API_KEY, DATABASE_URL, NEXTAUTH_SECRET
```

## Data Model

```
users
  id            TEXT PRIMARY KEY
  email         TEXT UNIQUE
  name          TEXT
  created_at    TIMESTAMP

child_profiles
  id            TEXT PRIMARY KEY
  user_id       TEXT FK → users
  name          TEXT
  age           INTEGER
  interests     TEXT          -- comma-separated or JSON array
  challenges    TEXT          -- free text
  created_at    TIMESTAMP

partner_links
  id            TEXT PRIMARY KEY
  user_a_id     TEXT FK → users
  user_b_id     TEXT FK → users
  status        TEXT          -- 'pending' | 'active'
  created_at    TIMESTAMP

collection_moments
  id            TEXT PRIMARY KEY
  user_id       TEXT FK → users
  child_id      TEXT FK → child_profiles (nullable — null = couple moment)
  type          TEXT          -- 'morning' | 'transition' | 'afterschool' | 'play' | 'bedtime' | 'holdonto' | 'custom'
  title         TEXT
  description   TEXT
  active        BOOLEAN DEFAULT true
  source        TEXT          -- 'default' | 'ai' | 'manual'
  created_at    TIMESTAMP

daily_logs
  id            TEXT PRIMARY KEY
  user_id       TEXT FK → users
  moment_id     TEXT FK → collection_moments
  date          TEXT          -- 'YYYY-MM-DD'
  completed     BOOLEAN
  note          TEXT          -- optional reflection
  completed_at  TIMESTAMP
  UNIQUE(user_id, moment_id, date)

reflections
  id            TEXT PRIMARY KEY
  user_id       TEXT FK → users
  date          TEXT
  mood          TEXT          -- 'connected' | 'struggling' | 'mixed' | 'growing'
  note          TEXT
  created_at    TIMESTAMP
```

## Mastra Agent Design

### Collection Coach Agent

The primary AI agent. Lives at `src/mastra/agents/collection-coach.ts`.

```typescript
import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { suggestMomentsTool } from "../tools/suggest-moments";
import { assessProgressTool } from "../tools/assess-progress";
import { adaptMomentsTool } from "../tools/adapt-moments";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = openrouter(process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5");

export const collectionCoach = new Agent({
  id: "collection-coach",
  name: "Collection Coach",
  description: "An attachment-informed parenting coach that helps parents create and maintain daily collection rituals.",
  instructions: `You are a warm, knowledgeable parenting coach grounded in Gordon Neufeld's attachment framework from "Hold On to Your Kids."

Your core principle: CONNECTION BEFORE DIRECTION.

"Collecting" a child means re-establishing the attachment relationship — making them feel seen, wanted, and oriented to you — before asking anything of them. You help parents design daily micro-rituals that do this naturally.

KNOWLEDGE BASE:
- The 6 stages of attachment: proximity, sameness, belonging/loyalty, significance, love, being known
- Collection works through: eye contact, a smile, a nod, physical touch, warmth in the voice
- Key transition moments: morning, drop-off, pickup, after school, dinner, bedtime
- Peer orientation: when children orient to peers instead of parents for direction, it undermines maturity
- "Bridging" separation: giving children something to hold onto when apart
- Invite dependence to foster true independence
- Tears of futility: allowing sadness/frustration instead of fixing

BEHAVIOR RULES:
- Never be prescriptive or judgmental about parenting choices
- Suggest, don't command. Use "you might try" not "you should"
- Keep suggestions age-appropriate and specific to the child's interests
- Acknowledge that parents are already doing good work
- When suggesting moments, always explain the WHY from attachment science
- For couples: collection applies to partners too — same principles of making someone feel found
- Keep responses warm but concise — parents are busy
- If a parent describes concerning behavior (aggression, withdrawal, self-harm), gently suggest professional support

TOOL USAGE:
- Use suggestMomentsTool when a parent asks for new collection ideas
- Use assessProgressTool when reviewing their tracking data
- Use adaptMomentsTool when they report something isn't working`,
  model,
  tools: { suggestMomentsTool, assessProgressTool, adaptMomentsTool },
});
```

### Tools

**suggest-moments** (`src/mastra/tools/suggest-moments.ts`):
- Input: child name, age, interests, challenges, existing moments, time of day preference
- Output: 3-5 personalized collection moment suggestions with attachment science rationale
- The tool queries the child profile and generates contextual suggestions

**assess-progress** (`src/mastra/tools/assess-progress.ts`):
- Input: user ID, date range
- Output: completion rates, streak data, patterns (e.g., "mornings are strong, after-school is inconsistent"), encouragement
- Reads from daily_logs table

**adapt-moments** (`src/mastra/tools/adapt-moments.ts`):
- Input: moment ID, feedback (what's not working), child context
- Output: modified moment suggestion or alternative approach
- Helps iterate when a moment doesn't fit

### Chat Route

The AI coach is exposed at `src/app/api/chat/route.ts` using `handleChatStream` from `@mastra/ai-sdk`:

```typescript
import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const params = await req.json();
  const stream = await handleChatStream({
    mastra,
    agentId: "collection-coach",
    params,
  });
  return createUIMessageStreamResponse({ stream });
}
```

## Design System

### Design Philosophy

The visual language of Collected should feel like a well-loved parenting book — warm, grounded, literary, and quietly confident. Never clinical, never SaaS-dashboard. Every surface should feel like it was designed for a human, not a user.

**Aesthetic direction**: Warm literary minimalism with paper texture. Think a favorite bookshop's reading nook, not a tech startup's onboarding flow.

### Typography

**Display / Headings**: Alegreya (serif, variable weight 400–700)
- Literary, rhythmic, alive — calligraphic roots with a bookish personality
- Each letter breathes differently, giving text a handwritten quality
- The expansive Alegreya family includes sans, small caps, and true italics
- Google Fonts: `family=Alegreya:ital,wght@0,400;0,500;0,600;0,700;1,400`

**Body**: Source Sans 3 (sans-serif, variable weight 300–700)
- Neutral, highly readable, designed for long-form digital content
- Complements Alegreya's personality without competing
- Google Fonts: `family=Source+Sans+3:wght@300;400;500;600;700`

**Type Scale** (use these exact sizes — do not invent intermediate sizes):

| Token | Font | Size | Weight | Use |
|---|---|---|---|---|
| `display-xl` | Alegreya | 32px | 600 | App name, hero numbers |
| `display-lg` | Alegreya | 24px | 600 | Page titles ("Today's Collection") |
| `display-md` | Alegreya | 20px | 600 | Section headings |
| `display-sm` | Alegreya | 16px | 600 | Card titles, moment names |
| `body-lg` | Source Sans 3 | 16px / 1.6 | 400 | Primary body text, coach chat |
| `body-md` | Source Sans 3 | 14px / 1.5 | 400 | Descriptions, secondary text |
| `body-sm` | Source Sans 3 | 13px / 1.5 | 400 | Captions, helper text |
| `label` | Source Sans 3 | 11px / 0.1em tracking | 600 | Uppercase labels, section markers |
| `stat` | Alegreya | 28px | 700 | Progress ring numbers, streak counts (tabular-nums) |

**Rules**:
- Alegreya italic for taglines and philosophical phrases ("connection before direction")
- Never use Alegreya below 14px — switch to Source Sans 3
- letter-spacing: -0.02em on display-xl, -0.01em on display-lg
- All labels are uppercase with 0.1em letter-spacing

### Color Palette

Four ramps + three named surfaces. Each ramp has a specific semantic role.

**Earth — primary ramp** (text, buttons, chrome)

| Token | Hex | Use |
|---|---|---|
| `earth-950` | #2A1810 | Darkest, rare emphasis |
| `earth-900` | #3D2B1F | Primary text, primary button bg |
| `earth-800` | #5C4033 | Secondary text, gradients |
| `earth-700` | #6E5240 | Body text |
| `earth-600` | #8B7355 | Accents, progress rings, active states |
| `earth-500` | #A6895D | Muted text, timestamps |
| `earth-400` | #C4A882 | Borders, disabled states |
| `earth-300` | #D4C4A8 | Subtle dividers |
| `earth-200` | #E8DCC8 | Card borders, input borders |
| `earth-100` | #F2EBDF | Hover backgrounds |
| `earth-50` | #FFF8EE | Lightest tint |

**Sage — positive ramp** (streaks, completion, encouragement)

| Token | Hex | Use |
|---|---|---|
| `sage-700` | #4A6741 | Success text on light bg |
| `sage-600` | #5E8052 | Streak badge bg, icon strokes |
| `sage-500` | #7A9E6D | Progress fills |
| `sage-400` | #9BB88E | Lighter accent |
| `sage-300` | #B8CFA9 | Icon fills |
| `sage-100` | #E8F0E2 | Badge bg, icon circle bg |

**Clay — warm accent ramp** (AI coach, energy, warmth)

| Token | Hex | Use |
|---|---|---|
| `clay-700` | #8C4A2F | Coach text on light bg |
| `clay-600` | #A85C3A | AI badge, icon strokes |
| `clay-500` | #C47245 | Morning icon accent |
| `clay-400` | #D4936A | Lighter warm accent |
| `clay-300` | #E4B494 | Icon fills |
| `clay-100` | #F8E8DA | Coach bg, warm tint |

**Rose — gentle alert ramp** (partner features, soft warnings)

| Token | Hex | Use |
|---|---|---|
| `rose-700` | #8C4A5E | Alert text on light bg |
| `rose-600` | #A85C72 | Play icon stroke, partner accent |
| `rose-500` | #C47288 | Lighter accent |
| `rose-400` | #D493A4 | Icon fills |
| `rose-300` | #E4B4C0 | Soft border |
| `rose-100` | #F8E0E8 | Badge bg, icon circle bg |

**Named Surfaces**:

| Token | Hex | Use |
|---|---|---|
| `linen` | #FFFCF7 | Card backgrounds, input bg |
| `cream` | #FFF5E6 | On-dark text, elevated surface |
| `parchment` | #F5EDE0 | Page background, bottom gradient |

**Rules**:
- Never introduce purple, blue, neon, or cold-toned colors
- Primary buttons use `linear-gradient(135deg, earth-900, earth-800, earth-600)`
- Text on dark buttons/badges uses `cream`
- The page background is always `parchment` with paper grain texture overlay

### Paper Grain Texture

Applied to page backgrounds and large panels only (never cards or small elements). Implemented as an SVG feTurbulence noise overlay at **4% opacity**:

```css
.paper-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
  pointer-events: none;
}
```

### Spacing Scale

Base unit: **4px**. Use only these values:

| Token | px | Use |
|---|---|---|
| `space-1` | 4 | Tight inline gaps |
| `space-2` | 8 | Icon-to-text, compact gaps |
| `space-3` | 12 | Card internal gaps, between inline items |
| `space-4` | 16 | Default gap between elements |
| `space-5` | 20 | Page horizontal padding (mobile) |
| `space-6` | 24 | Page horizontal padding (tablet+), section headers |
| `space-8` | 32 | Between cards in a list |
| `space-10` | 40 | Between major sections |
| `space-12` | 48 | Large section spacing |
| `space-16` | 64 | Page top/bottom padding |

### Border Radius

| Token | px | Use |
|---|---|---|
| `radius-sm` | 6 | Inputs, small chips |
| `radius-md` | 10 | Chips, tags, ghost buttons |
| `radius-lg` | 14 | Primary/secondary buttons |
| `radius-xl` | 16 | Cards, moment cards |
| `radius-2xl` | 20 | Panels, progress card |
| `radius-3xl` | 24 | Bottom sheets (top corners only) |
| `radius-full` | 50% | Avatars, circular progress, toggles |

### Iconography

**Style**: Custom hand-drawn SVG line icons with 1.8px stroke width, round caps and joins. Each moment type has a dedicated icon rendered on a colored circular background (48px circle).

**Moment type → icon → color mapping**:

| Type | Icon | Circle bg | Stroke color |
|---|---|---|---|
| Morning | Stylized sun with rays | `clay-100` | `clay-600` |
| Transition | Backpack/bridge shape | `sage-100` | `sage-600` |
| After school | House with warm door | `earth-100` | `earth-600` |
| Play | Building blocks | `rose-100` | `rose-600` |
| Bedtime | Crescent moon + stars | #E8E4F0 | #7B6B8A |
| Hold onto | Connected figures | `clay-100` | `clay-600` |
| Custom | Star burst | `sage-100` | `sage-600` |

**UI chrome icons**: Use Lucide React (`lucide-react`) for navigation, settings, chevrons, and utility icons. Size: 20px for nav, 16px for inline. Color: `earth-600` default, `earth-900` active.

**Rules**:
- Never use emoji for moment types — always the custom SVG icons
- Lucide icons for structural UI only, never for moment types
- Icon stroke width is always 1.8px for moment icons, 1.5px for Lucide
- Icons inside colored circles get a slight fill on the main shape at 0.6 opacity using the ramp's 300 stop

### Motion & Animation

**Core curves**:

| Name | CSS | Duration | Use |
|---|---|---|---|
| Enter | `ease-out` | 0.3s | Cards appearing, sheets sliding up, fade-in |
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 0.4s | Checkbox check, toggle snap, satisfying interactions |
| Gentle | `ease-in-out` | 2s | Ambient pulse on streaks, coach button glow |
| Exit | `ease-in` | 0.2s | Dismissing sheets, removing elements |

**Patterns**:
- **Stagger siblings by 50ms**: When a list of cards appears, each is delayed by 50ms (`animation-delay: calc(index * 50ms)`)
- **Bottom sheets**: Slide up from bottom, 0.3s ease-out. Backdrop fades in 0.2s.
- **Checkbox**: On check, the box fills with `earth-600` using the spring curve, then the SVG checkmark draws on with a 0.15s stroke-dashoffset animation
- **Progress ring**: SVG stroke-dashoffset transition, 0.6s ease-out, animates when completion changes
- **Streak badge**: Gentle pulse animation when streak is active (scale 1→1.02→1, 3s loop)
- **Page transitions**: Fade + 8px translateY, 0.3s ease-out

**Rules**:
- Never use bounce or elastic easing on exit animations
- Never animate color — only transform, opacity, and SVG stroke properties
- Reduce motion: wrap all animations in `@media (prefers-reduced-motion: no-preference)`
- Keep total animation under 0.5s for interactions, 0.3s for micro-feedback

### Component Patterns

**Moment Card** (primary interaction surface):
- Background: `linen` unchecked, `earth-100` checked (with 0.7 opacity)
- Border: 1px `earth-200`, radius `radius-xl` (16px)
- Padding: 16px 18px
- Checkbox: 28×28px, radius 8px, border 2px `earth-300` unchecked → solid `earth-600` checked
- Title: `display-sm` (Alegreya 16px 600), line-through + opacity 0.6 when checked
- Description: `body-sm` with left margin 26px (aligns with text after checkbox)
- Icon: moment type icon (18px inline, no circle bg) left of title

**Progress Card** (today view hero):
- Background: `linen`, radius `radius-2xl` (20px)
- Border: 1px rgba(139,115,85,0.1), box-shadow: `0 4px 24px rgba(139,115,85,0.06)`
- Contains: circular progress ring (120px) + stats + streak badge
- Progress ring: SVG, 8px stroke, `earth-600` fill on track `rgba(earth-600, 0.15)`

**Buttons**:
- Primary: gradient bg (`earth-900` → `earth-800` → `earth-600`), `cream` text, radius `radius-lg`, padding 14px 24px, shadow `0 4px 20px rgba(earth-950, 0.25)`
- Secondary: transparent bg, 1.5px `earth-300` border, `earth-900` text, radius `radius-lg`
- Ghost: `rgba(earth-600, 0.08)` bg, `earth-700` text, radius `radius-md`, padding 8px 14px

**Bottom Sheet**:
- Top radius: `radius-3xl` (24px), flat bottom
- Background: `linen`
- Backdrop: `rgba(earth-950, 0.4)` + `backdrop-filter: blur(6px)`
- Max height: 85vh, scrollable
- Handle: optional 40×4px `earth-300` rounded bar centered at top

**Input Fields**:
- Border: 1.5px `earth-200`, radius `radius-sm` (6px)
- Background: `linen`
- Font: Source Sans 3 15px
- Focus: border-color transitions to `earth-600`
- Padding: 12px 14px

**Badges/Pills**:
- Streak: gradient `earth-600` → `earth-500`, `cream` text, radius `radius-full`
- Status: ramp `100` bg + ramp `700` text (e.g., sage-100 bg + sage-700 text)
- Padding: 6px 14px, font: Source Sans 3 13px 600

**Week Heatmap Cells**:
- 32×32px circles inside 48px max-width tap targets
- Fill ratio: empty = transparent, >0 = `rgba(earth-600, 0.15)`, ≥50% = `rgba(earth-600, 0.4)`, 100% = solid `earth-600`
- Today: 2px `earth-900` border
- Selected: 2px `earth-600` border on parent
- Day labels: `label` style (Source Sans 3 10px uppercase `earth-500`)

### Tailwind Configuration

```js
// tailwind.config.ts — extend section
{
  fontFamily: {
    display: ['Alegreya', 'Georgia', 'serif'],
    body: ['Source Sans 3', 'system-ui', 'sans-serif'],
  },
  colors: {
    earth: {
      950: '#2A1810', 900: '#3D2B1F', 800: '#5C4033', 700: '#6E5240',
      600: '#8B7355', 500: '#A6895D', 400: '#C4A882', 300: '#D4C4A8',
      200: '#E8DCC8', 100: '#F2EBDF', 50: '#FFF8EE',
    },
    sage: {
      700: '#4A6741', 600: '#5E8052', 500: '#7A9E6D', 400: '#9BB88E',
      300: '#B8CFA9', 100: '#E8F0E2',
    },
    clay: {
      700: '#8C4A2F', 600: '#A85C3A', 500: '#C47245', 400: '#D4936A',
      300: '#E4B494', 100: '#F8E8DA',
    },
    rose: {
      700: '#8C4A5E', 600: '#A85C72', 500: '#C47288', 400: '#D493A4',
      300: '#E4B4C0', 100: '#F8E0E8',
    },
    linen: '#FFFCF7',
    cream: '#FFF5E6',
    parchment: '#F5EDE0',
  },
  borderRadius: {
    sm: '6px', md: '10px', lg: '14px', xl: '16px',
    '2xl': '20px', '3xl': '24px', full: '9999px',
  },
  spacing: {
    // extends default — add only custom tokens if needed
  },
}
```

## PWA Requirements

- `manifest.json` with `display: standalone`, earth-tone theme color
- Service worker caching strategy: network-first for API, cache-first for static assets
- Offline: show last cached today view, queue check-ins for sync when online
- Install prompt: show after 3rd visit if not installed

## Key Behaviors

1. **Today View** (primary screen): Shows circular progress, week strip, and list of active moments as checkable cards. Checking a moment saves immediately via server action.

2. **Week View**: Calendar heatmap showing 4 weeks. Tap a day to see that day's log. Streak counter prominent.

3. **AI Coach**: Chat interface using AI SDK UI. Pre-populated conversation starters: "Help me create moments for my 6-year-old", "Mornings are really hard", "My child seems more peer-oriented lately".

4. **Moments Management**: Toggle moments active/inactive, reorder, add custom moments manually, or generate via AI coach.

5. **Partner Mode**: Link two accounts. Shared child profiles. Each partner tracks their own collection practice, but can see partner's streaks (encouragement, not surveillance).

## Implementation Order

1. **Phase 1 — Core Loop**: Next.js scaffold, database schema, today view with check-in, server actions for logging
2. **Phase 2 — Mastra Agent**: Install Mastra, create collection-coach agent + tools, wire up chat route and coach page
3. **Phase 3 — Tracking**: Week view, streak calculation, progress analytics
4. **Phase 4 — PWA**: Manifest, service worker, offline support, install prompt
5. **Phase 5 — Social**: Partner linking, shared profiles, encouragement features
6. **Phase 6 — Polish**: Onboarding flow, AI-powered weekly reflections, push notifications for reminder nudges

## Commands

```bash
# Development
npm run dev          # Next.js dev server (port 3000)
npx mastra dev       # Mastra Studio (port 4111) — test agents in isolation

# Database
npx drizzle-kit push  # Push schema changes
npx drizzle-kit studio # Drizzle Studio for DB inspection

# Build
npm run build        # Production build
npm run start        # Production server
```

## Environment Variables

```
OPENROUTER_API_KEY=          # Required — get from https://openrouter.ai/keys
OPENROUTER_MODEL=anthropic/claude-sonnet-4-5  # Default model, swap anytime
DATABASE_URL=file:collected.db
NEXTAUTH_SECRET=             # Generated secret for auth
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=            # Optional, for Google OAuth
GOOGLE_CLIENT_SECRET=        # Optional
```

## Notes for AI Agents (Claude Code, Cursor, Windsurf)

- **Mastra APIs change rapidly.** Always check embedded docs at `node_modules/@mastra/core/dist/docs/` before writing Mastra code. Never rely on training data.
- **TypeScript config must use ES2022 modules** with bundler resolution. CommonJS will break Mastra.
- **Model format is `"provider/model-name"`** — e.g., `"anthropic/claude-sonnet-4-5"`. The model is passed via OpenRouter's AI SDK provider, not Mastra's built-in model string. See agent definition for the pattern.
- **OpenRouter model is env-configurable.** `OPENROUTER_MODEL` defaults to `anthropic/claude-sonnet-4-5` but can be swapped to any OpenRouter-supported model without code changes. Install `@openrouter/ai-sdk-provider` alongside `@mastra/core`.
- **Import paths matter**: Use `@mastra/core/agent` not `@mastra/core` for Agent, `@mastra/core/tools` for createTool.
- **The design palette is warm earth tones.** Never introduce purple gradients, neon accents, or cold blues. The aesthetic should feel like a well-loved book, not a SaaS dashboard.
- **Typography**: Display font is **Alegreya** (serif), body font is **Source Sans 3** (sans-serif). Never substitute Inter, DM Sans, Roboto, or system fonts. Alegreya has a literary, rhythmic personality — that's intentional. Never use Alegreya below 14px.
- **Icons**: Moment types use custom hand-drawn SVG line icons (1.8px stroke, round caps). Never use emoji for moment types. Use Lucide React for UI chrome only.
- **Paper texture**: Page backgrounds get an SVG feTurbulence grain at 4% opacity. Never apply grain to cards or small components.
- **Tone in all user-facing copy**: Warm, encouraging, never clinical. "Collection moments" not "tasks." "Practice" not "compliance." "Connection" not "intervention."
- **Test agents in Mastra Studio** (`npx mastra dev` at port 4111) before integrating with Next.js routes.
