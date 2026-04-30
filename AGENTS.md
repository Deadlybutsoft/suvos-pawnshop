# AGENTS.md

This document is the persistent UI/UX design reference for all future contributors and agents working on this project.

## Purpose

Maintain a **cohesive game-like visual identity** for the Suvo's Pawnshop app.  
When adding or editing UI, follow this guide so new features match the existing style and do not drift into generic web-app aesthetics.

---

## Design North Star

Build interfaces that feel like a **playable game HUD/menu**, not a plain dashboard.

Core characteristics:

1. **Brown + Yellow/Gold palette** (warm, tactile, pawn-shop vibe)
2. **Bulky, high-weight typography** (Bungee / Bungee Shade for titles)
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

### Fonts (loaded via Google Fonts in `index.html`)

- **Bungee Shade** — primary display font for big titles (hero, login, level select, rules)
- **Bungee** — secondary display font for subtitles, buttons, labels, level names, input text
- **Fallback stack:** `"Impact"`, `"Arial Black"`, `"Haettenschweiler"`, `"Trebuchet MS"`, sans-serif

### Usage

- Use `Bungee Shade` for page titles and hero headings
- Use `Bungee` for all UI labels, buttons, and body text in onboarding screens
- Use uppercase for labels/actions where appropriate
- Use wider letter-spacing for UI labels and menu headings
- Keep body text readable; avoid thin/light fonts in key UI actions

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
- Avoid floaty "SaaS-style" motion that conflicts with tactile design.

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

## Do / Don't

### Do

- Keep everything in the warm brown/gold identity.
- Use gradients and shadows for depth.
- Keep typography bold and game-like (Bungee / Bungee Shade).
- Reuse the design primitives already defined.

### Don't

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
- [ ] Typography uses Bungee / Bungee Shade for display text
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
- **Voice TTS:** ElevenLabs REST API (`/v1/text-to-speech/{voice_id}`) — NPC voices (unique per personality)
- **Voice STT:** ElevenLabs REST API (`/v1/speech-to-text`) — player mic via MediaRecorder
- **Sound Effects:** ElevenLabs-generated MP3s (pre-baked in `public/sfx/`)
- **Images:** Wikimedia Commons thumbnail URLs, cached in memory
- **Fonts:** Google Fonts — Bungee Shade + Bungee

### API Keys

- Keys are loaded from `.env.local` via Vite `define` (build-time injection)
- Players can override keys in the in-game Settings menu (stored in `localStorage`)
- Priority: `localStorage` user key → `.env.local` default key
- Env vars: `GROQ_API_KEY`, `ELEVENLABS_API_KEY`

### Game Flow

1. **Hero Screen** — "SUVO'S PAWNSHOP" title, press any key / tap to start
2. **Login Screen** — enter character name (no password, stored in localStorage)
3. **Level Select** — 5 levels (1 unlocked by default), glowing current level circle
4. **Rules Screen** — 7 game rules, must check agreement box to proceed
5. **Game** — 3D pawn shop, NPCs, haggling, phone, inventory

### Core Game Loop

1. **Sellers arrive automatically** (every 15-25s) or via "Wait for Seller" button
2. **Buyers arrive** via "Run Ad" ($500) or walk in randomly (every 40-60s)
3. Player negotiates via text input or voice (ElevenLabs STT)
4. NPC responds via Groq LLM + ElevenLabs TTS (unique voice per NPC)
5. Deals trigger `[ACTION: DEAL $X]` — updates money, inventory, transactions
6. NPCs leave via `[ACTION: LEAVE]` or after a deal

### Economy

| Item | Cost |
|------|------|
| Starting cash | $10,000 |
| Item base values | $600–$15,000 |
| Run Ad (attract buyer) | $500 |
| Expert: Dr. Harrison | $300/call |
| Expert: Prof. Miller | $500/call |
| Expert: Mr. Vance | $750/call |
| Rent (landlord) | $2,000–$4,000 |

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

- 3 expert contacts on the iPhone: Dr. Harrison ($300), Prof. Miller ($500), Mr. Vance ($750)
- Call flow: ring (2s) → 50/50 pickup → fee deducted → AI conversation about current item
- Expert knows the truth (fake/stolen/authentic) and hints accordingly
- Full chat UI with text input + ElevenLabs TTS for expert voice
- Located in iPhone → Contacts app

### NPC Voice System

Each NPC personality has a unique ElevenLabs voice ID:

| NPC | Voice |
|-----|-------|
| s1 — Angry male seller | George |
| s2 — Forgetful female seller | Charlotte |
| s3 — Funny male seller | Charlie |
| s4 — Paranoid female seller | Alice |
| s5 — Snobby male seller | Callum |
| s6 — Romantic female seller | Jessica |
| s7 — Confused male seller | Daniel |
| Buyers/Collectors | James, Lily, Liam, etc. |
| Dr. Harrison | James |
| Prof. Miller | Daniel |
| Mr. Vance | Callum |

### NPC Character System (`src/components/scene/NPCCharacter.tsx`)

3D box-style characters with randomized traits:

- **10 skin tones**, **15 shirt colors**, **12 pant colors**, **13 hair colors**
- **8 hair styles:** flat, tall, mohawk, side-part, long, bald, afro, buzz
- **Accessories (independent chances):** glasses (25%), hats — cap/beanie/tophat (25%), chains (20%), scarves (15%), headbands (10%), earrings (40% female / 15% male), jackets (30%), beards — full/goatee/stubble (35% male)
- **Animations:** mouth lip-sync when talking, arm gestures while talking, walk arm swing, idle body sway, head micro-movement, eye blinking (irregular timing)
- **Body variation:** randomized width, height, head scale
- **Details:** eye whites + colored pupils, eyebrows, ears, shoes, hands

### Sound Effects (`public/sfx/`)

Pre-generated via ElevenLabs Sound Effects API, served as static MP3 files (zero API calls during gameplay):

| File | Trigger |
|------|---------|
| `click.mp3` | Button presses |
| `door.mp3` | NPC enters / leaves |
| `bell.mp3` | NPC enters (after door) |
| `deal.mp3` | Deal is made |
| `phone.mp3` | Expert call starts |
| `error.mp3` | Game over (busted) |
| `levelup.mp3` | Level complete |

### Starting Inventory

- Player begins with 5 random authentic items (generated via `getStartingInventory()`)
- Ensures buyers have something to purchase from the start

### Level System

- 5 levels: Rookie Dealer → Street Hustler → Sharp Eye → Master Dealer → Pawn King
- Unlock progress saved per player in `localStorage` (`pawn-level-{name}`)
- Level complete screen with stats + "Next Level" button
- Victory fanfare sound on completion

### Game Over Screen

- Triggered by selling fakes, selling stolen goods, or buying stolen goods (if caught)
- Shows: reason, money earned, items traded, inventory value
- "Try Again" returns to level select screen

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main game component — all UI, state, game logic |
| `src/lib/items.ts` | Item database, authenticity system, spawn logic |
| `src/lib/npcPrompts.ts` | NPC personality definitions and system prompts |
| `src/components/scene/PawnShop.tsx` | 3D pawn shop scene (room, doors, counter with table texture) |
| `src/components/scene/NPCCharacter.tsx` | 3D NPC character rendering and animation |
| `src/components/scene/ItemBoxes.tsx` | 3D item boxes on counter (hover glow, click to inspect) |
| `src/components/onboarding/OnboardingHero.tsx` | Hero/splash screen (tap to start) |
| `src/components/onboarding/LoginScreen.tsx` | Login screen (name entry, no password) |
| `src/components/onboarding/LevelSelect.tsx` | Level select (5 levels, circle UI) |
| `src/components/onboarding/RulesScreen.tsx` | Rules screen (7 rules, agreement checkbox) |
| `src/components/onboarding/OnboardingSetup.tsx` | Setup screen (currently bypassed) |
| `src/index.css` | All `game-*` CSS classes and `--game-*` tokens |
| `index.html` | Entry HTML, Google Fonts loading |
| `vite.config.ts` | Build config, env var injection |
| `.env.local` | API keys (GROQ_API_KEY, ELEVENLABS_API_KEY) |
| `public/sfx/` | Pre-generated ElevenLabs sound effect MP3s |

### NPC Types

| Type | Behavior |
|------|----------|
| `SELLER` | Brings items to sell — auto-spawns every 15-25s, or via "Wait for Seller" button |
| `BUYER` | Wants to buy from inventory — via "Run Ad" ($500) or random walk-in |
| `COLLECTOR` | High-end buyer, willing to pay more — via "Run Ad" or random walk-in |
| `EXPERT` | Appraiser (spawned via walk-in, also callable via phone) |
| `DELIVERY` | Drops off packages |
| `LANDLORD` | Demands rent payment ($2,000–$4,000) |

### Z-Index Layering

The 3D Canvas must stay at `z-index: 0` (set via inline style on `<Canvas>`).  
All HUD/UI elements use Tailwind z-classes above it:

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Canvas (3D) | `z-0` | Three.js scene |
| HUD top bar | `z-10` | Money display, settings button, time |
| NPC subtitles | `z-10` | Chat bubbles, reply/mic/dismiss buttons |
| Settings | `z-20` | Pause/settings menu |
| Phone UI | `z-30` | iPhone overlay + apps |
| Bottom buttons | `z-40` | Inventory, Phone, Wait for Seller, Run Ad |
| Modals | `z-50` | Inventory modal, shortcuts modal, item inspection |
| Call overlay | `z-[90]` | Expert phone call UI |
| Level complete | `z-[100]` | Victory screen |
| Game over | `z-[100]` | BUSTED / jail screen |

### Static Assets (`public/`)

| File | Purpose |
|------|---------|
| `pawnshop-hero.png` | Hero screen background |
| `login-bg.png` | Login screen background |
| `level-bg.png` | Level select background |
| `rules-bg.png` | Rules screen background |
| `table.png` | Counter/table texture |
| `floor.png` | Floor texture |
| `wall.png`, `left-wall.png`, `right-wall.png`, `baclk-wall.png` | Wall textures |
| `door-wall.png`, `door-left.png`, `door-right.png` | Door textures |
| `cling.png` | Ceiling texture |
| `sfx/*.mp3` | Sound effects (7 files) |

### Known Issues & Notes

- The `<Canvas>` must have `style={{ position: "absolute", inset: 0, zIndex: 0 }}` or it will stack above UI buttons
- Some Wikimedia image URLs may 404 — the game still works, images just won't load for those items
- Pre-existing TypeScript warning: `iconColor` property on phone app icons (non-blocking)
- ElevenLabs TTS falls back to browser `speechSynthesis` if the API call fails
- STT uses MediaRecorder (click to start, click to stop) — not continuous listening
- Expert call messages are stateless per call (no persistence between calls)
- The OnboardingSetup screen exists but is currently bypassed in the flow
- GitHub repo has moved to `https://github.com/Deadlybutsoft/suvos-pawnshop.git`
