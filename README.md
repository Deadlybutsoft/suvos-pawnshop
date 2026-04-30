<div align="center">
<img width="1200" height="475" alt="Pawn Game Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🏪 Pawn Game

**A 3D pawn shop simulator where you haggle with AI-powered NPCs, spot fakes, and try not to get arrested.**

Built with React · Three.js · Groq AI · ElevenLabs

</div>

---

## 🎮 What Is This?

You run a pawn shop. NPCs walk through the door — sellers, buyers, collectors — each with unique personalities and items. Negotiate prices using text or your real voice. But watch out: **some items are fake, some are stolen**, and one bad deal can land you in jail.

### Core Loop

1. **NPCs arrive** through the shop door with historical items
2. **Haggle** via text input or voice (ElevenLabs speech-to-text)
3. **NPCs respond** with AI-generated dialogue + voice (Groq LLM + ElevenLabs TTS)
4. **Close deals** — buy low, sell high, grow your inventory
5. **Avoid fakes & stolen goods** — or face game over

### The Twist

- **60% of items are authentic**, 30% are fake, 10% are stolen
- Fake sellers drop subtle clues — vague provenance, nervous behavior, inconsistent dates
- Stolen item sellers are evasive and eager to sell fast
- **Sell a fake or stolen item → JAILED → Game Over**
- **Buy stolen goods → 50% chance police catch you → Game Over**

### Expert System

Call experts from your in-game iPhone to authenticate items before buying:

| Expert | Fee | Specialty |
|--------|-----|-----------|
| Dr. Harrison | $100 | Historian — European & Asian antiquities |
| Prof. Miller | $150 | Antique appraiser — 30 years experience |
| Mr. Vance | $200 | Museum executive — art authentication |

Experts have a **50/50 chance of picking up**. When they do, they give AI-powered hints about whether an item is real, fake, or stolen — via full voice conversation.

---

## 🗂️ Item Database

**150 historical items** across 15 categories:

Weapons · Jewelry · Art · Antiques · Ceramics · Navigation · Instruments · Manuscripts · Relics · Armor · Textiles · Sculptures · Coins · Timepieces · Tools

Each item has a name, description, region, category, base value, rarity tier (common → legendary), and a Wikimedia Commons image.

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| 3D Scene | react-three-fiber + drei (Three.js) |
| AI Dialogue | Groq SDK — Llama 3.1 8B Instant |
| Voice TTS | ElevenLabs REST API — NPC & expert voices |
| Voice STT | ElevenLabs REST API — player microphone |
| Item Images | Wikimedia Commons (cached in memory) |

---

## 🚀 Run Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Add your API keys
cp .env.example .env.local
# Edit .env.local with your keys:
#   GROQ_API_KEY=gsk_...
#   ELEVENLABS_API_KEY=xi_...

# 3. Start the dev server
npm run dev
```

Open http://localhost:3000

> **Note:** Players can also add their own API keys in the in-game Settings menu — no restart needed.

---

## 🔑 API Keys

| Key | Where to get it | Required for |
|-----|----------------|--------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | NPC dialogue & expert calls |
| `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) | Voice TTS & speech-to-text |

Both have free tiers that work for playing the game.

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Main game — all UI, state, game logic
├── lib/
│   ├── items.ts                     # 150 items, authenticity system, spawn logic
│   └── npcPrompts.ts                # NPC personalities and system prompts
├── components/
│   ├── scene/
│   │   ├── PawnShop.tsx             # 3D room, doors, furniture
│   │   ├── NPCCharacter.tsx         # 3D NPC rendering & animation
│   │   ├── Lighting.tsx             # Scene lighting
│   │   ├── GlassShelves.tsx         # Display shelves
│   │   └── ItemBoxes.tsx            # Item box props
│   └── onboarding/
│       ├── OnboardingHero.tsx       # Title screen
│       └── OnboardingSetup.tsx      # Game setup screen
├── index.css                        # All game-* CSS classes & tokens
└── main.tsx                         # Entry point
```

---

## 🎨 Design System

The UI follows a **game HUD aesthetic** — warm brown/gold palette, chunky borders, arcade-like interactions. See [AGENTS.md](AGENTS.md) for the full design reference including theme tokens, approved CSS classes, and component styling rules.

---

## 📄 License

MIT
