# Collected — Implementation Specification

*A PWA for practicing daily connection rituals, powered by AI attachment coaching*

---

## 1. Product Vision

Collected helps parents and couples build the habit of intentional connection. Rooted in Gordon Neufeld's attachment framework from *Hold On to Your Kids*, the app treats connection as a daily practice — not a parenting technique, but something you show up for every day like exercise or meditation.

The core insight: **connection before direction.** Every time you need cooperation, attention, or compliance from a child (or warmth and presence from a partner), a brief moment of genuine "collection" first makes everything easier.

### What "Collecting" Means

Collecting someone means re-establishing the attachment relationship. For a child, this looks like eye contact, a warm smile, physical closeness, and showing genuine interest in their world before making any requests. For a partner, it's the same principle — pausing to truly *see* them before diving into logistics, problems, or the day's demands.

### Why an App

Parents know they should connect with their kids. The problem isn't knowledge — it's consistency. Collected gives you a lightweight daily ritual: a short list of personalized collection moments you check off throughout the day. Over time, the streaks and patterns make the invisible work of attachment visible and motivating.

The AI coach (powered by Mastra) personalizes this further by understanding your specific child — their age, their interests, your family's pain points — and generating moments that actually fit your life.

---

## 2. User Personas

**Primary: The Intentional Parent**
Has read (or heard about) attachment parenting principles. Wants to put them into practice daily but struggles with consistency, especially during rushed mornings and post-school chaos. Likely has a child aged 3-10.

**Secondary: The Co-Parenting Couple**
Two parents who want to stay aligned on connection practices. Not about surveillance — about shared commitment. "Did we both collect today?"

**Tertiary: The Reconnecting Partner**
Couples without children (or with grown children) who recognize that the same attachment principles apply to adult relationships. The app adapts its language from "child collection" to "partner connection."

---

## 3. Information Architecture

```
[Landing Page]
     │
     ├── Sign Up / Login
     │
     └── [Dashboard Shell] ── Bottom Navigation
              │
              ├── Today (default)
              │     • Circular progress ring
              │     • Week strip (7 days)
              │     • Collection moment cards (checkable)
              │     • Daily reflection prompt
              │
              ├── History
              │     • 4-week calendar heatmap
              │     • Streak counter + best streak
              │     • Completion trends by moment type
              │     • Tap any day → day detail view
              │
              ├── Coach (AI)
              │     • Chat interface (streaming)
              │     • Conversation starters
              │     • Tool results inline (suggested moments)
              │     • "Add to my practice" action on suggestions
              │
              └── Profile
                    • Child profiles (add/edit/remove)
                    • Partner linking
                    • Manage moments (toggle, reorder, delete)
                    • Notification preferences
                    • Account settings
```

---

## 4. Core User Flows

### 4.1 Onboarding

1. User signs up (email magic link or Google)
2. "Who are you collecting?" — add first child profile (name, age, interests) or select "My partner"
3. AI coach generates 5 starter moments based on profile
4. User reviews, selects which to keep → lands on Today view
5. Optional: invite partner to link accounts

### 4.2 Daily Check-In

1. Open app → Today view shows active moments
2. Tap a moment card to mark complete (immediate server action, optimistic UI)
3. Progress ring animates to reflect completion
4. At 50%+ completion, streak counter increments
5. Optional: tap the reflection prompt at bottom to add a note about the day

### 4.3 AI Coach Conversation

1. User opens Coach tab
2. Sees conversation starters: "Help me with mornings", "My child seems distant", "Suggest bedtime rituals"
3. Types or taps a starter → streams response from collection-coach agent
4. Agent may call suggest-moments tool → renders moment cards inline
5. User taps "Add to my practice" on any suggestion → server action creates moment
6. Conversation persists via Mastra memory (thread per user)

### 4.4 Partner Linking

1. User A goes to Profile → "Invite Partner" → generates invite link
2. User B clicks link → creates account → link is established
3. Both users share child profiles
4. Each tracks their own moments independently
5. Week view shows partner's streak alongside yours (read-only)

---

## 5. Technical Architecture

### 5.1 System Diagram

```
┌─────────────────────────────────────────────┐
│  Client (PWA)                                │
│  Next.js App Router + Service Worker         │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Today    │  │ History  │  │ Coach     │  │
│  │ View     │  │ View     │  │ (AI SDK   │  │
│  │          │  │          │  │  UI Chat) │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │        │
└───────┼──────────────┼──────────────┼────────┘
        │              │              │
   Server Actions  Server Actions  POST /api/chat
        │              │              │
┌───────┼──────────────┼──────────────┼────────┐
│  Next.js Server                              │
│                                              │
│  ┌──────────────┐   ┌───────────────────┐   │
│  │ Server       │   │ Mastra Instance    │   │
│  │ Actions      │   │                    │   │
│  │ (moments,    │   │ ┌───────────────┐  │   │
│  │  logs,       │   │ │ collection-   │  │   │
│  │  profiles)   │   │ │ coach agent   │  │   │
│  └──────┬───────┘   │ └───────┬───────┘  │   │
│         │           │         │           │   │
│         │           │  ┌──────┴────────┐  │   │
│         │           │  │ Tools:        │  │   │
│         │           │  │ • suggest     │  │   │
│         │           │  │ • assess      │  │   │
│         │           │  │ • adapt       │  │   │
│         │           │  └───────────────┘  │   │
│         │           └────────┬────────────┘   │
│         │                    │                │
│  ┌──────┴────────────────────┴──────────┐    │
│  │        LibSQL (SQLite)                │    │
│  │  users, child_profiles, moments,      │    │
│  │  daily_logs, reflections,             │    │
│  │  mastra_threads, mastra_messages      │    │
│  └───────────────────────────────────────┘    │
│                                              │
│         ┌──────────────┐                     │
│         │ OpenRouter    │                    │
│         │ (default:     │                    │
│         │  claude-      │                    │
│         │  sonnet-4-5)  │                    │
│         └──────────────┘                     │
└──────────────────────────────────────────────┘
```

### 5.2 Key Technical Decisions

**Why Next.js App Router?** Server Components reduce client bundle. Server Actions give us type-safe mutations without REST boilerplate. The streaming architecture pairs naturally with Mastra's AI SDK integration.

**Why LibSQL?** Zero-config SQLite that works locally and can scale to Turso for production. Mastra has a first-party `@mastra/libsql` storage adapter. One database for both app data and Mastra's agent memory.

**Why Mastra over raw API calls?** The collection coach needs memory (conversation history), tools (accessing child profiles, generating structured moment suggestions), and a well-defined system prompt. Mastra wraps all of this in a testable, observable package. The Studio UI at port 4111 lets us iterate on the agent without touching the frontend.

**Why not a separate Mastra backend?** For this app's scale, the "direct integration" pattern (importing Mastra directly into Next.js server actions and routes) is simpler. One deployment, one database. If we need to scale the AI independently later, we can extract to a separate service with `@mastra/client-js`.

---

## 6. Mastra Agent Specification

### 6.1 Collection Coach Agent

**Purpose**: Help parents design, iterate on, and reflect on daily collection moments personalized to their child and family situation.

**Model**: Routed via OpenRouter (`@openrouter/ai-sdk-provider`). Default: `anthropic/claude-sonnet-4-5`. Configurable at runtime via `OPENROUTER_MODEL` env var — swap to any OpenRouter-supported model without code changes.

**System Instructions**: See CLAUDE.md for the full prompt. Key principles:
- Grounded in Neufeld's 6 stages of attachment
- Suggests, never prescribes
- Explains the "why" from attachment science
- Keeps responses concise (parents are busy)
- Adapts language for couple mode vs. parent mode

### 6.2 Tool Specifications

**suggest-moments**
```
Input:
  childName: string
  childAge: number
  interests: string[]
  challenges: string (free text)
  existingMoments: { type, title }[]
  preferredTimeOfDay?: 'morning' | 'midday' | 'evening' | 'bedtime'

Output:
  suggestions: {
    type: MomentType
    title: string
    description: string
    rationale: string     // why this works from attachment science
    ageAppropriate: boolean
  }[]
```

**assess-progress**
```
Input:
  userId: string
  startDate: string (YYYY-MM-DD)
  endDate: string (YYYY-MM-DD)

Output:
  completionRate: number           // 0-1
  currentStreak: number
  bestStreak: number
  strongestMomentType: string      // which type has highest completion
  weakestMomentType: string
  pattern: string                  // natural language insight
  encouragement: string            // warm, specific praise
```

**adapt-moments**
```
Input:
  momentId: string
  currentMoment: { type, title, description }
  feedback: string                 // what's not working
  childContext: { name, age, interests }

Output:
  adaptedMoment: {
    title: string
    description: string
    rationale: string
  }
  alternative?: {                  // completely different approach
    type: MomentType
    title: string
    description: string
    rationale: string
  }
```

### 6.3 Memory Strategy

Each user gets a persistent Mastra memory thread (`thread_id = user_id`, `resource_id = "collection-coach"`). This means:
- The coach remembers previous conversations
- It can reference the child's name, age, and past suggestions without re-asking
- Conversation history is loaded on chat page mount via GET endpoint

---

## 7. API Design

All data mutations use **Server Actions** (no REST API for CRUD). The only traditional API route is the AI chat endpoint.

### Server Actions (`src/lib/actions/`)

```typescript
// moments.ts
"use server"
export async function createMoment(data: CreateMomentInput): Promise<Moment>
export async function updateMoment(id: string, data: Partial<Moment>): Promise<Moment>
export async function deleteMoment(id: string): Promise<void>
export async function toggleMomentActive(id: string): Promise<Moment>
export async function reorderMoments(ids: string[]): Promise<void>

// logs.ts
"use server"
export async function toggleLog(momentId: string, date: string): Promise<DailyLog>
export async function addReflection(date: string, mood: Mood, note: string): Promise<Reflection>
export async function getWeekLogs(startDate: string): Promise<WeekLogData>
export async function getStreakData(userId: string): Promise<StreakData>

// profiles.ts
"use server"
export async function createChildProfile(data: CreateChildInput): Promise<ChildProfile>
export async function updateChildProfile(id: string, data: Partial<ChildProfile>): Promise<ChildProfile>
export async function deleteChildProfile(id: string): Promise<void>
export async function invitePartner(email: string): Promise<InviteLink>
export async function acceptPartnerInvite(token: string): Promise<PartnerLink>
```

### AI Chat Route

```
POST /api/chat
  Body: { messages, memory: { thread, resource } }
  Response: Streaming (createUIMessageStreamResponse)

GET /api/chat
  Response: JSON array of previous messages (for hydration)
```

---

## 8. Offline & PWA Strategy

### Service Worker Caching

| Route Pattern | Strategy | Rationale |
|---|---|---|
| `/today`, `/week` | Stale-while-revalidate | Show cached view instantly, update in background |
| `/api/chat` | Network-only | AI responses can't be meaningfully cached |
| Static assets | Cache-first | Fonts, icons, JS bundles |
| `/api/*` (other) | Network-first | Prefer fresh data, fall back to cache |

### Offline Check-In Queue

When offline, checking a moment stores the action in IndexedDB. When connectivity returns, the service worker replays the queue against server actions. UI shows a subtle "syncing..." indicator.

### Install Prompt

After the 3rd visit (tracked in localStorage), show a dismissible banner: "Add Collected to your home screen for quick daily check-ins." Respect the `beforeinstallprompt` event.

---

## 9. Implementation Phases

### Phase 1: Core Loop (Week 1-2)
- [ ] Next.js 15 scaffold with App Router, TypeScript, Tailwind
- [ ] LibSQL database + Drizzle ORM schema
- [ ] Auth (NextAuth v5, email magic link)
- [ ] Today view: progress ring, moment cards, check/uncheck
- [ ] Server actions for moment CRUD and daily log toggle
- [ ] Default moments seeded on first login
- [ ] Basic responsive mobile layout

### Phase 2: Mastra Agent (Week 3-4)
- [ ] Install Mastra (`@mastra/core`, `@mastra/ai-sdk`, `@mastra/libsql`) + OpenRouter (`@openrouter/ai-sdk-provider`)
- [ ] Create collection-coach agent with full system prompt
- [ ] Implement suggest-moments tool (reads child profile, returns structured suggestions)
- [ ] Chat route with streaming via handleChatStream
- [ ] Coach page with AI SDK UI + AI Elements
- [ ] "Add to my practice" action on AI suggestions
- [ ] Test agent in Mastra Studio

### Phase 3: Tracking & Insights (Week 5)
- [ ] Week heatmap view (4-week calendar)
- [ ] Streak calculation (50%+ active moments = streak day)
- [ ] Implement assess-progress tool
- [ ] Weekly AI reflection (scheduled or on-demand)
- [ ] Completion trends by moment type

### Phase 4: PWA (Week 6)
- [ ] manifest.json (standalone, earth-tone theme)
- [ ] Service worker via next-pwa
- [ ] Offline check-in queue (IndexedDB → replay)
- [ ] Install prompt after 3rd visit
- [ ] App icons (192px, 512px)

### Phase 5: Partner Mode (Week 7-8)
- [ ] Partner invite flow (magic link)
- [ ] Shared child profiles
- [ ] Partner streak visibility (read-only)
- [ ] Couple mode (collection moments for partners)

### Phase 6: Polish (Week 9-10)
- [ ] Onboarding flow (guided child profile + AI moment generation)
- [ ] Push notifications (morning reminder, bedtime nudge)
- [ ] Adapt-moments tool (iterate on what's not working)
- [ ] Animations (Framer Motion for check, progress ring, streaks)
- [ ] Dark mode (warm dark palette, not pure black)
- [ ] Performance audit (Core Web Vitals)

---

## 10. Moment Type Taxonomy

| Type | Icon | When | Example |
|---|---|---|---|
| morning | ☀️ | Before the day begins | "5 mins of eye contact + ask about their world" |
| transition | 🔄 | Between contexts | "Be glad to see them at pickup before asking questions" |
| afterschool | 🏠 | Re-entry after separation | "Sit together for 5 mins before homework" |
| play | 🎮 | Unstructured time | "Follow their lead — Lego, superheroes, whatever" |
| bedtime | 🌙 | Wind-down | "Same sequence: stories, quiet chat, the day's best moment" |
| holdonto | 🧸 | Bridging separation | "Special handshake, pocket object, predictable joke" |
| custom | ✨ | User-defined | Whatever fits the family |

---

## 11. Success Metrics

- **Activation**: User completes first full day of check-ins within 3 days of signup
- **Retention**: 40%+ of users active (≥1 check-in) after 30 days
- **Engagement**: Average 4+ moments checked per active day
- **AI Usage**: 60%+ of users interact with coach at least once in first week
- **Streaks**: Median streak length of 5+ days among retained users
- **Partner Adoption**: 20%+ of users invite a partner within 2 weeks
