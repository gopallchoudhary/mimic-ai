# Mimic AI — Project Documentation

> Chat with AI personas modeled after popular tech content creators. Each persona has custom speech patterns, expertise areas, and personality traits baked into a system prompt that drives the LLM.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [How It Works End-to-End Flow](#4-how-it-works-end-to-end-flow)
5. [Context Management](#5-context-management)
6. [Authentication and Route Protection](#6-authentication-and-route-protection)
7. [Persona Data Model](#7-persona-data-model)
8. [AI Pipeline](#8-ai-pipeline)
9. [UI Architecture](#9-ui-architecture)
10. [Theme System](#10-theme-system)
11. [Known Issues and Notes](#11-known-issues-and-notes)
12. [Environment Variables](#12-environment-variables)

---

## 1. Project Overview

**Mimic AI** is a Next.js web application where authenticated users can chat with AI personas of real-world tech educators (e.g., Hitesh Choudhary, Piyush Garg). Each persona is backed by:

- A detailed **system prompt** generated from a static data file
- A **streaming LLM response** via OpenRouter's free API
- A customizable **tone** (Default / Funny / Advice / Educational) and **temperature** per conversation

The app is stateless per session — conversation history lives in the browser via the `useChat` hook from `@ai-sdk/react`. There is no database.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.10 |
| **Runtime** | React | 19.2.4 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS v4 | ^4 |
| **Component Library** | shadcn/ui (Radix-based) | ^4.12.0 |
| **Animation** | tw-animate-css + custom @keyframes | ^1.4.0 |
| **AI SDK (client)** | @ai-sdk/react | ^4.0.15 |
| **AI SDK (server)** | ai (Vercel AI SDK v7) | ^7.0.13 |
| **LLM Provider** | OpenRouter (via @ai-sdk/openai compatible client) | ^4.0.6 |
| **Authentication** | Clerk (@clerk/nextjs) | ^7.5.12 |
| **Theme** | next-themes | ^0.4.6 |
| **Markdown** | react-markdown + remark-gfm | ^10.1.0 / ^4.0.1 |
| **Syntax Highlighting** | react-syntax-highlighter (Prism) | ^16.1.1 |
| **Icons** | lucide-react | ^1.23.0 |
| **Package Manager** | pnpm | - |
| **Build Tool** | Turbopack (via Next.js) | - |

---

## 3. Folder Structure

```
mimic-ai/
├── src/
│   ├── ai/                          # AI logic layer
│   │   ├── basePromptGenerator.ts   # Builds system prompt from persona data
│   │   └── response.ts              # Calls streamText via OpenRouter
│   │
│   ├── app/                         # Next.js App Router pages
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts         # POST /api/chat — streaming endpoint
│   │   ├── chat/
│   │   │   ├── page.tsx             # /chat — Persona selection grid
│   │   │   └── [personaId]/
│   │   │       └── page.tsx         # /chat/:personaId — Active chat room
│   │   ├── sign-in/[[...sign-in]]/  # Clerk-hosted sign-in page
│   │   ├── sign-up/[[...sign-up]]/  # Clerk-hosted sign-up page
│   │   ├── page.tsx                 # / — Landing page (Hero section)
│   │   ├── layout.tsx               # Root layout (ClerkProvider + ThemeProvider + Header)
│   │   └── globals.css              # Tailwind v4 @theme tokens + global @keyframes
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # shadcn/ui primitives (Button, Card, Avatar, Slider...)
│   │   ├── ChatInput.tsx            # Message input form + settings panel toggle
│   │   ├── ChatMessage.tsx          # Single message bubble (user or persona)
│   │   ├── ChatSidebar.tsx          # Left sidebar: persona list + account + theme toggle
│   │   ├── Header.tsx               # Top nav bar (hidden in /chat/* routes)
│   │   ├── MarkdownRenderer.tsx     # Renders LLM markdown with syntax-highlighted code
│   │   ├── PersonaCard.tsx          # Glassmorphic card shown on /chat grid
│   │   ├── TemperatureSlider.tsx    # LLM temperature control (0.0 to 1.0)
│   │   ├── ThemeProvider.tsx        # Thin wrapper around next-themes
│   │   ├── ThemeToggle.tsx          # Light/Dark/System toggle button
│   │   └── ToneSelector.tsx         # Tone mode selector (Default/Funny/Advice/Educational)
│   │
│   ├── data/
│   │   ├── personas.ts              # Static array of all IPersona objects
│   │   └── types.ts                 # TypeScript interfaces (IPersona, PersonaTone, etc.)
│   │
│   ├── lib/
│   │   └── utils.ts                 # cn() utility (clsx + tailwind-merge)
│   │
│   └── proxy.ts                     # Clerk middleware for route protection
│
├── public/                          # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
├── components.json                  # shadcn/ui configuration
└── pnpm-workspace.yaml
```

---

## 4. How It Works End-to-End Flow

### Step 1 — Landing Page (/)

The hero page introduces the product. A "Start Chatting" CTA navigates to `/chat`.

### Step 2 — Persona Selection (/chat)

Displays all personas from `src/data/personas.ts` as glassmorphic PersonaCard components. Each card shows:
- Avatar, name, and title
- `persona.description` (first 150 chars)
- Expertise skill badges

Clicking a card navigates to `/chat/:personaId`.

### Step 3 — Chat Room (/chat/:personaId)

```
User types message
       |
       v
sendMessage({ text: input })   <-- from @ai-sdk/react useChat hook
       |
       v
DefaultChatTransport sends POST /api/chat
  body: { messages[], personaId, tone, temperature }
       |
       v
/api/chat route.ts:
  1. Finds persona by personaId from static personas array
  2. convertToModelMessages(messages) -> UIMessage[] to ModelMessage[]
  3. generateAIResponse(modelMessages, persona, tone, temperature)
       |
       v
src/ai/response.ts:
  1. basePromptGenerator(persona, tone) -> builds system prompt string
  2. streamText({ model, system, messages, temperature }) via OpenRouter
       |
       v
createUIMessageStreamResponse(stream) sent back as SSE stream
       |
       v
useChat hook updates messages state in real-time as tokens arrive
       |
       v
ChatMessage components render each message.parts entry
```

---

## 5. Context Management

### How conversation history is maintained

**Mimic AI is fully stateless on the server.** There is no database or cache. Context is managed entirely on the **client side** by the `useChat` hook.

#### Client Side

```ts
const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ personaId, tone, temperature }),
    }),
});
```

- `messages` is an in-memory array of `UIMessage` objects held in React state.
- Every time `sendMessage` is called, the **entire messages array** is included in the POST body automatically by the SDK.
- Each API call carries the **full conversation history**, giving the LLM memory of previous turns.

#### Server Side

```ts
const { messages, personaId, tone, temperature } = body;
const modelMessages = await convertToModelMessages(messages);
const result = await streamText({ system: systemPrompt, messages: modelMessages });
```

- The server receives the full `UIMessage[]` and converts them to `ModelMessage[]`.
- The system prompt (persona identity) is built fresh and prepended on every call.
- The LLM sees the full history plus the system prompt on every request.

#### Limitations

| Concern | Detail |
|---------|--------|
| No persistence | Refreshing the page resets the conversation |
| No cross-persona memory | Switching personas starts a fresh useChat instance |
| Context window | Long conversations will hit the LLM context window limit |
| Session isolation | Each browser tab has its own independent conversation state |

---

## 6. Authentication and Route Protection

Clerk handles auth. Middleware is defined in `src/proxy.ts`:

```ts
const isProtectedRoute = createRouteMatcher(['/chat/(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
```

| Route | Auth Required | Behavior |
|-------|--------------|----------|
| `/` | No (Redirects if Auth) | Public landing page for guests. If logged in, automatically redirected to `/chat`. |
| `/chat` | No | Public persona selection grid. |
| `/chat/:personaId` | Yes | Direct chat interface. Redirects to sign-in if unauthenticated. |
| `/sign-in` | No | Sign-in page. If already signed in, redirected to `/chat`. |
| `/sign-up` | No | Sign-up page. If already signed in, redirected to `/chat`. |

### Header visibility

`Header.tsx` uses `usePathname()` to hide itself on `/chat/*` routes since the chatroom has its own sidebar navigation. It is shown on `/`, `/sign-in`, and `/sign-up`.

---

## 7. Persona Data Model

All personas are defined in `src/data/personas.ts` as a static exported array. The interface in `src/data/types.ts`:

```ts
interface IPersona {
    id: string;               // URL slug (e.g., "hc", "pg")
    name: string;             // Display name
    title: string;            // Professional title shown on card
    description: string;      // Short public description (shown on PersonaCard)
    bio: string;              // Full background text injected into system prompt
    avatar: string;           // URL to profile image
    products?: Product[];     // SaaS/tool products with name, url, tag
    socials: SocialLink[];    // Social links: YouTube, X, GitHub, LinkedIn, etc.
    expertise: string[];      // Skill tags shown as badges on the card
    languages: ("English" | "Hindi" | "Hinglish")[];
    style: PersonaStyle;      // Voice description, traits[], tone phrases[]
    catchPhrases?: string[];
    fillerWords?: string[];
    resources?: Resource[];   // Courses and learning links injected into prompt
    examples: string;         // Sample conversation text injected into system prompt
}
```

### Adding a new persona

1. Add a new object to the `personas` array in `src/data/personas.ts`.
2. Set `bio`, `style`, `resources`, and `examples` carefully — these are injected directly into the LLM system prompt and shape all responses.
3. No other code changes needed. The entire app renders dynamically from the `personas` array.

---

## 8. AI Pipeline

### System Prompt (src/ai/basePromptGenerator.ts)

Built fresh on every API call:

```
PERSONA IDENTITY:   name, title, bio
YOUR EXPERTISE:     comma-separated skills
COMMUNICATION STYLE: voice, traits, tone phrases
RESOURCES:          course links with descriptions
YOUR SOCIALS:       platform URLs
YOUR PRODUCTS:      product name, type, URL
EXAMPLES:           raw sample conversation text
[SPECIAL TONE]:     injected only when tone != "default"
```

### LLM Call (src/ai/response.ts)

```ts
streamText({
    model: client('openrouter/free'),  // Free model pool on OpenRouter
    system: systemPrompt,
    messages,                          // Full conversation history
    temperature,                       // 0.0 to 1.0, default 0.6
})
```

### Streaming Response (/api/chat/route.ts)

```ts
return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
});
```

Response is a **Server-Sent Event (SSE) stream**. The `useChat` hook reads tokens incrementally and updates the messages state, producing the real-time typing effect.

### Tone Modes

| Tone | Effect |
|------|--------|
| `default` | No extra instruction |
| `funny` | More humor, emojis, light-hearted |
| `advice` | Mentorship-focused, practical |
| `educational` | Detailed explanations, teaching-style |

### Temperature

Default: `0.6`

| Range | Effect |
|-------|--------|
| 0.0–0.4 | Focused, consistent, factual |
| 0.5–0.7 | Balanced (default zone) |
| 0.8–1.0 | Creative, spontaneous, varied |

---

## 9. UI Architecture

### Component Tree

```
RootLayout (ClerkProvider + ThemeProvider)
  Header (hidden on /chat/*)
  Page Content
    /             Home — static server component
    /chat         Persona grid — static server component
    /chat/:id     Chat room — client component
                    ChatSidebar
                      Persona list (active dot on current)
                      UserButton (Clerk) + ThemeToggle
                    Chat header (persona avatar + name + online dot)
                    ScrollArea
                      Welcome card (only when messages is empty and not loading)
                      ChatMessage[] (per rendered message)
                        MarkdownRenderer (AI messages only)
                      Typing indicator (when isLoading = true)
                      Scroll anchor div
                    ChatInput
                      Text input + Send button
                      Settings panel (ToneSelector + TemperatureSlider)
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `ChatSidebar` | Persona navigation, account section, theme toggle |
| `ChatMessage` | Single message bubble — user avatar from Clerk, persona avatar from data |
| `ChatInput` | Controlled form, Enter key shortcut, settings panel toggle |
| `MarkdownRenderer` | Parses and renders LLM markdown with Prism code highlighting |
| `TemperatureSlider` | Shadcn Slider with dynamic label text per range |
| `ToneSelector` | Four-option toggle for persona tone mode |
| `PersonaCard` | Glassmorphic hover card for persona selection grid |
| `ThemeToggle` | Light / Dark / System cycle using next-themes |

### Typing Indicator Logic

```ts
const isLoading = status === "submitted" || status === "streaming";
const showTypingIndicator = isLoading && (
    renderedMessages.length === 0 ||
    renderedMessages[renderedMessages.length - 1].role === "user"
);
```

- `submitted`: request sent, waiting for first token
- `streaming`: tokens arriving but assistant message not yet visible

### Message Rendering

AI SDK v7 stores message content in `message.parts[]` (not `message.content`):

```ts
// Extracting text from a UIMessage
const text = message.parts
    .filter(p => p.type === "text")
    .map(p => p.text)
    .join("");
```

Empty assistant messages (streaming placeholder with no parts yet) are filtered out before rendering to avoid blank bubbles.

---

## 10. Theme System

### Tailwind v4 Custom Tokens (globals.css)

```css
@theme inline {
  --animate-typing-dot: typingDot 1.4s infinite ease-in-out both;
  --animate-slide-up:   slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-fade-in:    fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* IMPORTANT: Must be at root level in Tailwind v4 — not inside @theme */
@keyframes typingDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

> In Tailwind v4, `@keyframes` must be defined at **root level** outside `@theme inline`. If nested inside `@theme`, the browser never sees them and animations do not play.

### next-themes

ThemeProvider uses `attribute="class"` so the active theme is set as a class on `<html>`. CSS dark mode variables are scoped under `.dark {}`.

---

## 11. Known Issues and Notes

### Message Echo Bug

The persona sometimes repeats or echoes previous message content. Root causes:

1. `persona.examples` is injected as raw free-form text in the system prompt. The LLM can confuse example conversation turns with the actual message history.
2. `openrouter/free` routes to unpredictable free-tier models with variable instruction-following quality.

### No Persistent History

All chat state is in-memory React state. Refreshing or navigating away permanently loses the conversation. To add persistence, a backend store (Postgres, Vercel KV, Upstash Redis) would need to be integrated.

### Context Window Limits

Long conversations are passed in full to the LLM on every request. There is no message trimming or summarization. Very long sessions will eventually fail or degrade.

---

## 12. Environment Variables

Required in `.env`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# OpenRouter LLM API
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for client-side auth |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side middleware |
| `OPENROUTER_API_KEY` | API key to access OpenRouter LLM gateway |
| `OPENROUTER_BASE_URL` | OpenRouter base URL (OpenAI-compatible endpoint) |
