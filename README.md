# Collected

> *Connection before direction.*

A PWA for parents (and couples) to create, track, and reflect on daily **collection moments** — intentional connection rituals rooted in Gordon Neufeld's attachment framework from *Hold On to Your Kids*.

A Mastra AI coach helps you generate personalized moments based on your child's age, interests, and current family challenges, then helps you iterate when something isn't working.

---

## What is "collecting"?

Collecting a child means re-establishing the attachment relationship — making them feel seen, wanted, and oriented to you — before asking anything of them. It happens through eye contact, a warm smile, physical closeness, genuine interest in their world.

The app gives you a short daily checklist of personalized micro-rituals: a morning greeting, a joyful pickup, a bedtime ritual. Checking them off makes the invisible work of attachment visible and builds momentum over time.

---

## Features

- **Today view** — circular progress ring, 7-day week strip, checkable moment cards with optimistic UI
- **4-week heatmap** — streak tracking, best streak, day-by-day completion history
- **AI Collection Coach** — streaming chat interface powered by Claude via OpenRouter; generates moment suggestions inline with "Add to my practice" actions
- **Moments management** — toggle active/paused, add manually, remove
- **Child profiles** — name, age, interests, challenges (used to personalize AI suggestions)
- **Partner mode** — invite a partner to share child profiles and see each other's streaks
- **PWA** — installable, standalone display, earth-tone theme

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | LibSQL (SQLite) via `@libsql/client` |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 (email magic links + Google OAuth) |
| AI Agent | Mastra (`@mastra/core`, `@mastra/ai-sdk`, `@mastra/libsql`) |
| LLM | OpenRouter (`@openrouter/ai-sdk-provider`), default `anthropic/claude-sonnet-4-5` |
| Icons | Lucide React (UI chrome) + custom hand-drawn SVG (moment types) |

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your keys:

```bash
# AI / LLM — required for the coach
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=anthropic/claude-sonnet-4-5   # optional override

# Database
DATABASE_URL=file:collected.db

# Auth — generate with: openssl rand -base64 32
AUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email magic links (Resend) — required for sign-in
AUTH_RESEND_KEY=your_resend_key_here

# Google OAuth — optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Get an OpenRouter key at [openrouter.ai/keys](https://openrouter.ai/keys). Get a Resend key at [resend.com](https://resend.com).

### 3. Push the database schema

```bash
npm run db:push
```

This creates the SQLite database and all tables (users, child profiles, collection moments, daily logs, reflections, partner links).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with your email — a magic link will be sent via Resend. On first login, five default collection moments are seeded automatically.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/login/            # Sign-in page
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Authenticated shell + bottom nav
│   │   ├── today/               # Daily check-in (primary screen)
│   │   ├── week/                # 4-week heatmap + streak stats
│   │   ├── coach/               # AI chat interface
│   │   ├── moments/             # Manage collection moments
│   │   └── settings/            # Child profiles, partner linking
│   ├── api/chat/                # Streaming AI endpoint (Mastra)
│   └── api/auth/                # NextAuth handlers
├── mastra/
│   ├── agents/collection-coach.ts   # The AI coach agent
│   └── tools/
│       ├── suggest-moments.ts       # Generates personalized suggestions
│       ├── assess-progress.ts       # Analyzes tracking patterns
│       └── adapt-moments.ts         # Iterates on what isn't working
├── lib/
│   ├── schema.ts                # Drizzle schema
│   ├── db.ts                    # Database client
│   ├── auth.ts                  # NextAuth config
│   ├── utils.ts                 # Streak calculation, date helpers
│   └── actions/                 # Server Actions (moments, logs, profiles)
└── components/
    ├── ui/                      # BottomNav, MomentIcon
    ├── today/                   # MomentCard, ProgressRing, WeekStrip, etc.
    ├── week/                    # MonthHeatmap
    ├── coach/                   # ChatInterface
    └── settings/                # SettingsClient
```

---

## AI agent

The **Collection Coach** (`collection-coach`) is a Mastra agent grounded in Neufeld's attachment framework. It has three tools:

| Tool | Purpose |
|---|---|
| `suggest-moments` | Generates 3–5 personalized moment ideas given a child's age, interests, and challenges |
| `assess-progress` | Analyzes completion patterns, calculates streaks, returns natural-language insight and encouragement |
| `adapt-moments` | Helps iterate on a moment that isn't working — adapts it or suggests a completely different approach |

The agent model is configured via `OPENROUTER_MODEL` — swap to any OpenRouter-supported model without code changes.

To test the agent in isolation:

```bash
npx mastra dev   # Mastra Studio at http://localhost:4111
```

---

## Database

```bash
npm run db:push     # Apply schema to database
npm run db:studio   # Open Drizzle Studio (visual DB browser)
```

The database lives at `collected.db` by default. Change `DATABASE_URL` in `.env.local` to use a different path or a Turso remote database.

---

## Design system

The visual language is **warm literary minimalism** — a favourite bookshop's reading nook, not a SaaS dashboard.

- **Display font**: Alegreya (serif, literary and rhythmic)
- **Body font**: Source Sans 3 (neutral, highly readable)
- **Colours**: Earth (primary browns), Sage (greens/success), Clay (warm orange/AI), Rose (mauve/partner) — no purple, blue, or neon
- **Surfaces**: Linen `#FFFCF7`, Cream `#FFF5E6`, Parchment `#F5EDE0`
- **Texture**: SVG feTurbulence paper grain at 4% opacity on page backgrounds

---

## Implementation phases

- [x] **Phase 1** — Core loop: scaffold, database, auth, today view, server actions
- [x] **Phase 2** — Mastra agent: collection-coach, tools, streaming chat route and UI
- [x] **Phase 3** — Tracking: 4-week heatmap, streak calculation
- [ ] **Phase 4** — PWA: offline check-in queue, install prompt after 3rd visit
- [ ] **Phase 5** — Partner mode: shared child profiles, partner streak visibility
- [ ] **Phase 6** — Polish: onboarding flow, push notifications, animations (Framer Motion), dark mode
