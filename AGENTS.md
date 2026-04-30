# AGENTS.md

This document is the persistent UI/UX design reference for all future contributors and agents working on this project.

## Purpose

Maintain a **cohesive game-like visual identity** for the Pawn Game app.  
When adding or editing UI, follow this guide so new features match the existing style and do not drift into generic web-app aesthetics.

---

## Design North Star

Build interfaces that feel like a **playable game HUD/menu**, not a plain dashboard.

Core characteristics:

1. **Brown + Yellow/Gold palette** (warm, tactile, pawn-shop vibe)
2. **Bulky, high-weight typography**
3. **Strong gradients and layered surfaces**
4. **Chunky borders and depth shadows**
5. **Arcade-like interactions** (hover lift, pressed state, tactile feedback)
6. **High legibility and clear visual hierarchy**

---

## Canonical Theme Tokens (Source of Truth)

Use CSS variables from `src/index.css` and avoid introducing random one-off colors.

### Current tokens

- `--game-bg-0: #25180f`
- `--game-bg-1: #3b2414`
- `--game-bg-2: #5a3a1f`
- `--game-surface: #3f2a1a`
- `--game-surface-raised: #5a3b22`
- `--game-surface-panel: #6b4728`
- `--game-border: #d5a24d`
- `--game-border-strong: #ffd877`
- `--game-text: #fff2cf`
- `--game-text-muted: #e9cc90`
- `--game-text-dim: #c79f60`
- `--game-accent: #ffcc4d`
- `--game-accent-hover: #ffb300`
- `--game-danger: #ef4444`
- `--game-success: #57d163`

If this palette evolves, update both `src/index.css` and this file together.

---

## Typography Rules

- Prefer heavy display feel:
  - `"Arial Black"`, `"Impact"`, `"Haettenschweiler"`, `"Trebuchet MS"`, sans-serif fallback stack
- Use uppercase for labels/actions where appropriate.
- Use wider letter-spacing for UI labels and menu headings.
- Keep body text readable; avoid thin/light fonts in key UI actions.

---

## Approved Core UI Classes

Always prefer these existing classes before creating new ones:

- Overlay: `game-overlay`
- Main shell/popup container: `game-menu-shell`
- Sidebar/header/footer:
  - `game-menu-sidebar`
  - `game-menu-header`
  - `game-menu-footer`
- Text:
  - `game-label`
  - `game-title`
  - `game-text-muted`
  - `game-text-dim`
  - `game-text-accent`
- Content blocks:
  - `game-panel`
  - `game-setting-row`
- Navigation:
  - `game-menu-tab`
  - `game-menu-tab-active`
- Buttons:
  - `game-button`
  - `game-button-primary`
  - `game-icon-button`
- Inputs/selects:
  - `game-input`
  - `game-select`
- Utility display:
  - `game-value-chip`
  - `game-toggle-track`
  - `game-shortcut-row`
  - `game-shortcut-key`
- FX utility:
  - `game-scanlines`

If a new reusable pattern is needed, add a new `game-*` class in `src/index.css` and document it here.

---

## Interaction & Motion Guidelines

- Buttons should feel physical:
  - Hover: slight lift (`translateY(-1px/-2px)`)
  - Active: slight press (`translateY(+1px/+2px)`)
  - Preserve chunky shadow behavior
- Keep animation durations short (`100ms–200ms`) for responsive game feel.
- Prefer subtle scale/translate over dramatic animations.
- Avoid floaty “SaaS-style” motion that conflicts with tactile design.

---

## Component Styling Policy

When adding UI in `src/App.tsx` or new components:

1. Use existing `game-*` classes first.
2. Use token-based colors (`var(--game-...)`) when custom CSS is needed.
3. Avoid arbitrary hex classes inline unless truly temporary/prototype.
4. Ensure all new modals/menus use:
   - `game-overlay` for backdrop
   - `game-menu-shell` for container
5. Ensure primary actions use `game-button-primary`.
6. Ensure secondary actions use `game-button`.

---

## Accessibility & Readability

- Maintain sufficient contrast between text and surfaces.
- Keep interactive targets comfortably sized.
- Preserve clear focus/hover states on interactive elements.
- Do not sacrifice readability for style, especially on smaller screens.

---

## Do / Don’t

### Do

- Keep everything in the warm brown/gold identity.
- Use gradients and shadows for depth.
- Keep typography bold and game-like.
- Reuse the design primitives already defined.

### Don’t

- Introduce cool/neon palette themes that conflict with this identity.
- Mix in flat, minimal web-app cards/buttons without depth.
- Add multiple unrelated font families.
- Use one-off visual styles that bypass the system.

---

## Implementation Checklist (for every UI PR)

- [ ] Uses existing `game-*` classes where applicable
- [ ] New styles rely on `--game-*` tokens
- [ ] Primary/secondary actions follow button hierarchy
- [ ] New overlays/modals match shell/backdrop system
- [ ] Typography remains bulky and legible
- [ ] No random off-theme colors introduced
- [ ] Mobile and desktop readability checked

---

## If You Need to Extend the System

When introducing a new UI pattern:

1. Add a reusable `game-*` class in `src/index.css`
2. Use existing tokens (or add new token only if necessary)
3. Document the class and usage in this file
4. Apply it consistently in all relevant components

---

## Quick Snippet Patterns

### Primary action

- Class recipe: `game-button-primary` + spacing classes

### Secondary action

- Class recipe: `game-button` + spacing classes

### Icon action

- Class recipe: `game-icon-button` + size/padding classes

### Standard modal

- Backdrop: `game-overlay`
- Container: `game-menu-shell`
- Heading: `game-title`
- Body fields: `game-input` / `game-select`

---

## Ownership

Any agent or engineer touching UI is responsible for preserving this system.  
If you intentionally change direction, update this file in the same change set with rationale.

---

## Game Architecture Reference

### Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **3D Scene:** react-three-fiber + drei (Three.js)
- **AI Dialogue:** Groq SDK (Llama 3.1 8B) — stateless chat completions with manual message history
- **Voice TTS:** ElevenLabs REST API (`/v1/text-to-speech/{voice_id}`) — NPC voices
- **Voice STT:** ElevenLabs REST API (`/v1/speech-to-text`) — player mic via MediaRecorder
- **Images:** Wikimedia Commons thumbnail URLs, cached in memory

### API Keys

- Keys are loaded from `.env.local` via Vite `define` (build-time injection)
- Players can override keys in the in-game Settings menu (stored in `localStorage`)
- Priority: `localStorage` user key → `.env.local` default key
- Env vars: `GROQ_API_KEY`, `ELEVENLABS_API_KEY`

### Core Game Loop

1. NPCs spawn through the door (sellers, buyers, collectors)
2. Player negotiates via text input or voice (ElevenLabs STT)
3. NPC responds via Groq LLM + ElevenLabs TTS
4. Deals trigger `[ACTION: DEAL $X]` — updates money, inventory, transactions
5. NPCs leave via `[ACTION: LEAVE]` or after a deal

### Item System (`src/lib/items.ts`)

- **150 historical items** across 15 categories: Weapons, Jewelry, Art, Antiques, Ceramics, Navigation, Instruments, Manuscripts, Relics, Armor, Textiles, Sculptures, Coins, Timepieces, Tools
- Each item: `id`, `name`, `description`, `region`, `category`, `baseValue`, `rarity`, `image` (Wikimedia URL)
- Rarity tiers: common, uncommon, rare, legendary
- Focus: European and Asian historical artifacts
- `getCachedImage()` ensures same item always shows same image

### Authenticity System

- **60% authentic, 30% fake, 10% stolen** (determined at spawn via `spawnItem()`)
- Hidden flags: `isAuthentic`, `isStolen` — player never sees these directly
- **Fake items:** Seller NPC gets AI prompt to drop subtle clues (vague provenance, nervous behavior, inconsistent dates)
- **Stolen items:** Seller NPC gets AI prompt to be evasive, eager to sell fast
- **Consequences:**
  - Sell a fake to a buyer → **JAILED / Game Over**
  - Sell stolen goods → **JAILED / Game Over**
  - Buy stolen goods → 50% chance police catch you → **JAILED / Game Over**

### Expert Calling System

- 3 expert contacts on the iPhone: Dr. Harrison ($100), Prof. Miller ($150), Mr. Vance ($200)
- Call flow: ring (2s) → 50/50 pickup → fee deducted → AI conversation about current item
- Expert knows the truth (fake/stolen/authentic) and hints accordingly
- Full chat UI with text input + ElevenLabs TTS for expert voice
- Located in iPhone → Contacts app

### Starting Inventory

- Player begins with 5 random authentic items (generated via `getStartingInventory()`)
- Ensures buyers have something to purchase from the start

### Game Over Screen

- Triggered by selling fakes, selling stolen goods, or buying stolen goods (if caught)
- Shows: reason, money earned, items traded, inventory value
- "Try Again" returns to hero/onboarding screen

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main game component — all UI, state, game logic |
| `src/lib/items.ts` | Item database, authenticity system, spawn logic |
| `src/lib/npcPrompts.ts` | NPC personality definitions and system prompts |
| `src/components/scene/PawnShop.tsx` | 3D pawn shop scene (room, doors, furniture) |
| `src/components/scene/NPCCharacter.tsx` | 3D NPC character rendering and animation |
| `src/index.css` | All `game-*` CSS classes and `--game-*` tokens |
| `vite.config.ts` | Build config, env var injection |
| `.env.local` | API keys (GROQ_API_KEY, ELEVENLABS_API_KEY) |

### NPC Types

| Type | Behavior |
|------|----------|
| `SELLER` | Brings items to sell — player haggles to buy low |
| `BUYER` | Wants to buy from inventory — player haggles to sell high |
| `COLLECTOR` | High-end buyer, willing to pay more for rare items |
| `EXPERT` | Appraiser (currently spawned via walk-in, experts also callable via phone) |
| `DELIVERY` | Drops off packages |
| `LANDLORD` | Demands rent payment |
