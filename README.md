<div align="center">

# 🏪 Suvo's Pawnshop

**A 3D pawn shop simulator where you haggle with AI-powered NPCs, spot fakes, and try not to get arrested.**

Built with React · Three.js · Groq AI · ElevenLabs

</div>

---

## What Is This?

You run a pawn shop. NPCs walk through the door — sellers, buyers, collectors — each with unique personalities, voices, and items. Negotiate prices using text or your real voice. But watch out: **some items are fake, some are stolen**, and one bad deal lands you in jail.

### How It Works

1. **NPCs arrive** through the shop door carrying historical items
2. **Haggle** via text or voice (ElevenLabs speech-to-text)
3. **NPCs respond** with AI dialogue + unique voices (Groq LLM + ElevenLabs TTS)
4. **Close deals** — buy low, sell high, grow your inventory
5. **Avoid fakes & stolen goods** — or it's game over

### The Catch

- 60% of items are authentic, 30% are fake, 10% are stolen
- Fake sellers drop subtle clues — vague provenance, nervous behavior, inconsistent dates
- Stolen item sellers are evasive and eager to sell fast
- Sell a fake or stolen item → **JAILED**
- Buy stolen goods → 50% chance police catch you → **JAILED**

### Expert System

Call experts from your in-game iPhone to authenticate items before buying:

| Expert | Fee | Specialty |
|--------|-----|-----------|
| Dr. Harrison | $300 | Historian — European & Asian antiquities |
| Prof. Miller | $500 | Antique appraiser — 30 years experience |
| Mr. Vance | $750 | Museum executive — art authentication |

Experts have a 50/50 chance of picking up. When they do, they give AI-powered hints about authenticity via full voice conversation.

### NPC Types

| Type | Behavior |
|------|----------|
| Seller | Brings items to sell — auto-spawns or via "Wait for Seller" |
| Buyer | Wants to buy from your inventory — via "Run Ad" ($500) or random walk-in |
| Collector | High-end buyer, pays more — via "Run Ad" or random walk-in |
| Landlord | Demands rent ($2,000–$4,000) |

---

## Item Database

**150 historical items** across 15 categories:

Weapons · Jewelry · Art · Antiques · Ceramics · Navigation · Instruments · Manuscripts · Relics · Armor · Textiles · Sculptures · Coins · Timepieces · Tools

Each item has a name, description, region, rarity tier (common → legendary), base value, and a Wikimedia Commons image.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| 3D Scene | react-three-fiber + drei (Three.js) |
| AI Dialogue | Groq SDK — Llama 3.1 8B Instant |
| Voice TTS | ElevenLabs REST API — unique voice per NPC |
| Voice STT | ElevenLabs REST API — player microphone |
| Sound Effects | Pre-generated MP3s (zero API calls during gameplay) |
| Item Images | Wikimedia Commons (cached in memory) |

---

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Add your API keys
cp .env.example .env.local
# Edit .env.local:
#   GROQ_API_KEY=gsk_...
#   ELEVENLABS_API_KEY=xi_...

# Start dev server
npm run dev
```

Open http://localhost:3000

> Players can also enter API keys in the in-game Settings menu — no restart needed.

### API Keys

| Key | Get it at | Used for |
|-----|-----------|----------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | NPC dialogue & expert calls |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) | Voice TTS & speech-to-text |

Both have free tiers sufficient for playing.

---

## Project Structure

```
src/
├── App.tsx                            # Main game — UI, state, game logic
├── main.tsx                           # Entry point
├── index.css                          # Game CSS classes & design tokens
├── hooks/
│   └── useGameSession.ts              # Session persistence hook
├── lib/
│   ├── items.ts                       # 150 items, authenticity, spawn logic
│   └── npcPrompts.ts                  # NPC personalities & system prompts
└── components/
    ├── onboarding/
    │   ├── OnboardingHero.tsx          # Title/splash screen
    │   ├── LoginScreen.tsx             # Name entry screen
    │   ├── LevelSelect.tsx             # Level select (5 levels)
    │   ├── RulesScreen.tsx             # Game rules & agreement
    │   └── OnboardingSetup.tsx         # Setup screen
    └── scene/
        ├── PawnShop.tsx                # 3D room, doors, furniture
        ├── NPCCharacter.tsx            # 3D NPC rendering & animation
        ├── ItemBoxes.tsx               # Item boxes on counter
        ├── GlassShelves.tsx            # Display shelves
        ├── Lighting.tsx                # Scene lighting
        └── CameraSetup.tsx             # Camera configuration
```

---

## Game Flow

1. **Hero Screen** — "SUVO'S PAWNSHOP" title, press any key to start
2. **Login** — enter your character name
3. **Level Select** — 5 levels (Rookie Dealer → Pawn King)
4. **Rules** — 7 game rules, must agree to proceed
5. **Game** — 3D pawn shop with NPCs, haggling, phone, inventory

---

## Design System

The UI follows a game HUD aesthetic — warm brown/gold palette, chunky borders, arcade-like interactions. All styles use `game-*` CSS classes and `--game-*` design tokens. See [AGENTS.md](AGENTS.md) for the full design reference.

---

## License

MIT
