/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Settings as SettingsIcon,
  X,
  Smartphone,
  Contact2,
  ShoppingBag,
  Landmark,
  Camera,
  Calculator,
  PhoneCall,
  Instagram,
  Twitter,
  Youtube,
  Github,
  MessageSquare,
  Map as MapIcon,
  CloudRain,
  Globe,
  Music,
  AudioWaveform,
  MessageCircle,
  Mail,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Store,
  Tag,
  PlusCircle,
  RefreshCcw,
  Clock,
  Pause,
  ChevronLeft,
  Send,
  Package,
  Megaphone,
  LayoutGrid,
  Play,
  Pause as PauseIcon,
  SkipForward,
  Volume2,
  Radio,
} from "lucide-react";
import Groq from "groq-sdk";
import {
  getRandomCustomer,
  getRandomNPCByType,
  NPCPersonality,
  NPCType,
} from "./lib/npcPrompts";
import { getRandomPawnItem } from "./lib/items";
import type { SpawnedItem } from "./lib/items";
import { spawnItem, getStartingInventory, getCachedImage } from "./lib/items";
import { CameraSetup } from "./components/scene/CameraSetup";
import { NPCCharacter } from "./components/scene/NPCCharacter";
import { Lighting } from "./components/scene/Lighting";
import { PawnShop } from "./components/scene/PawnShop";
import { ItemBoxes } from "./components/scene/ItemBoxes";
import { OnboardingHero } from "./components/onboarding/OnboardingHero";
import { LoginScreen } from "./components/onboarding/LoginScreen";
import { LevelSelect } from "./components/onboarding/LevelSelect";
import { RulesScreen } from "./components/onboarding/RulesScreen";
import OnboardingSetup, {
  type OnboardingSetupData,
} from "./components/onboarding/OnboardingSetup";

export default function App() {
  const [money, setMoney] = useState(10000);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // User-overridable API keys (localStorage backed, fallback to env)
  const [userGroqKey, setUserGroqKey] = useState(() => localStorage.getItem("userGroqKey") || "");
  const [userElevenLabsKey, setUserElevenLabsKey] = useState(() => localStorage.getItem("userElevenLabsKey") || "");
  const groqKey = userGroqKey || process.env.GROQ_API_KEY || "";
  const elevenLabsKey = userElevenLabsKey || process.env.ELEVENLABS_API_KEY || "";
  const validSteps = ["hero", "login", "levels", "rules", "setup", "game"] as const;
  type Step = (typeof validSteps)[number];
  const hashToStep = (): Step => {
    const h = window.location.hash.replace(/^#\/?/, "");
    return (validSteps as readonly string[]).includes(h) ? (h as Step) : "hero";
  };

  const [onboardingStep, setOnboardingStep] = useState<Step>(hashToStep);
  const [playerName, setPlayerName] = useState("");
  const [currentLevel, setCurrentLevel] = useState(1);

  // Sync state → hash
  useEffect(() => {
    window.location.hash = `/${onboardingStep}`;
  }, [onboardingStep]);

  // Sync hash → state (back/forward navigation)
  useEffect(() => {
    const onHashChange = () => setOnboardingStep(hashToStep());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingSetupData>(
    {
      ownerName: "",
      shopName: "Suvo's Pawnshop",
      difficulty: "dealer",
      startingCash: 10000,
      captionsEnabled: true,
      soundEnabled: true,
    },
  );

  // Multiple NPCs state
  const [activeNPCs, setActiveNPCs] = useState<
    {
      id: string; // unique instance id
      npc: NPCPersonality;
      isLeaving: boolean;
      chatHistory: { role: "model" | "user"; text: string }[];
      currentLine: string; // the string they are currently saying
      chatSession: { systemPrompt: string; messages: { role: "user" | "assistant"; content: string }[] }; // groq chat state
      position: [number, number, number]; // target standing pos
      item: string;
      itemData?: SpawnedItem;
      hasItemBox: boolean;
    }[]
  >([]);

  const [selectedItemBox, setSelectedItemBox] = useState<{
    id: string;
    itemName: string;
  } | null>(null);
  const [selectedItemImage, setSelectedItemImage] = useState<string | null>(
    null,
  );
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [showHudConfig, setShowHudConfig] = useState(false);
  const [hudButtons, setHudButtons] = useState({
    inventory: true, phone: true, waitSeller: true, runAd: true, settings: true,
  });

  // Radio state
  const [radioOpen, setRadioOpen] = useState(false);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioTrack, setRadioTrack] = useState(0);
  const [radioVolume, setRadioVolume] = useState(0.5);
  const radioRef = useRef<HTMLAudioElement | null>(null);
  const RADIO_TRACKS = [
    { name: "Jazz Lounge", file: "/music/jazz-lounge.mp3" },
    { name: "Retro Blues", file: "/music/retro-blues.mp3" },
    { name: "Acoustic Café", file: "/music/acoustic-cafe.mp3" },
    { name: "Vintage Swing", file: "/music/vintage-swing.mp3" },
  ];

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  // Phone State
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [phoneApp, setPhoneApp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  // Inventory State
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState<{name: string; region: string; boughtFor: number; date: string; image?: string; isAuthentic?: boolean; isStolen?: boolean; category?: string; description?: string}[]>(() => {
    return getStartingInventory().map(i => ({ name: i.name, region: i.region, boughtFor: Math.floor(i.baseValue * 0.6), date: "Day 1", image: getCachedImage(i), isAuthentic: i.isAuthentic, isStolen: i.isStolen, category: i.category, description: i.description }));
  });
  const [tradeHistory, setTradeHistory] = useState<{name: string; type: "bought" | "sold"; amount: number; date: string}[]>([]);
  const [inventorySearch, setInventorySearch] = useState("");

  // Game over state
  const [gameOver, setGameOver] = useState<{ reason: string } | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);

  // Play fanfare when level completes
  useEffect(() => { if (levelComplete) playSfx("levelup"); }, [levelComplete]);

  // Expert calling state
  const [activeCall, setActiveCall] = useState<{ contact: string; status: "ringing" | "connected" | "unavailable" | "ended"; messages: { role: "user" | "assistant"; content: string }[]; fee: number } | null>(null);

  // Messages App State
  const [messagesAppActiveChat, setMessagesAppActiveChat] = useState<
    number | null
  >(null);
  const [messagesInput, setMessagesInput] = useState("");
  const [messagesData, setMessagesData] = useState([
    {
      id: 1,
      name: "Mom",
      time: "10:42 AM",
      history: [{ sender: "her", text: "Did you list that item?" }],
    },
    {
      id: 2,
      name: "Jerry",
      time: "Yesterday",
      history: [{ sender: "him", text: "I can do $50, take it or leave it." }],
    },
    {
      id: 3,
      name: "Landlord",
      time: "Tuesday",
      history: [{ sender: "him", text: "Rent is due tomorrow!" }],
    },
  ]);

  // Market App State
  const [marketTab, setMarketTab] = useState<"feed" | "my_items">("feed");
  const [marketFeed] = useState([
    {
      id: 1,
      name: "Vintage Rolex",
      price: 36000,
      seller: "@watchguy",
      condition: "Like New",
    },
    {
      id: 2,
      name: "Charizard 1st Ed",
      price: 16500,
      seller: "@cardking",
      condition: "PSA 9",
    },
    {
      id: 3,
      name: "Signed Baseball",
      price: 2400,
      seller: "@sportsfan",
      condition: "Authenticated",
    },
    {
      id: 4,
      name: "Old Coin Collection",
      price: 4500,
      seller: "@numismatic",
      condition: "Various",
    },
  ]);
  const [myMarketItems] = useState([
    { id: 101, name: "Gold Ring", price: 900, status: "listed" },
    { id: 102, name: "Antique Vase", price: 2250, status: "sold" },
  ]);

  // Bank App State
  const [bankTransactions, setBankTransactions] = useState([
    {
      id: 1,
      title: "Item Sold (Vase)",
      date: "Today, 9:41 AM",
      amount: 750.0,
      type: "credit",
    },
    {
      id: 2,
      title: "Purchased Inventory",
      date: "Yesterday",
      amount: 300.0,
      type: "debit",
    },
    {
      id: 3,
      title: "Store Rent",
      date: "Oct 1",
      amount: 1200.0,
      type: "debit",
    },
    {
      id: 4,
      title: "Initial Deposit",
      date: "Sep 15",
      amount: 2250.0,
      type: "credit",
    },
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case " ": // Space
          e.preventDefault();
          if (!isPhoneOpen && activeNPCs.length < 2) {
            const btn = document.getElementById("btn-wait-customer");
            if (btn) btn.click();
          }
          break;
        case "p":
          setIsPhoneOpen((prev) => !prev);
          break;
        case "m":
          if (!isPhoneOpen) setIsPhoneOpen(true);
          setPhoneApp("market");
          break;
        case "b":
          if (!isPhoneOpen) setIsPhoneOpen(true);
          setPhoneApp("bank");
          break;
        case "c":
          if (!isPhoneOpen) setIsPhoneOpen(true);
          setPhoneApp("camera");
          break;
        case "i":
          if (!isPhoneOpen) setIsPhoneOpen(true);
          setPhoneApp("messages");
          break;
        case "escape":
          setIsSettingsOpen(false);
          setIsPhoneOpen(false);
          setSelectedItemBox(null);
          setShowInput(false);
          setShowShortcuts(false);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPhoneOpen, activeNPCs.length]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const aiRef = useRef<any>(null);

  useEffect(() => {
    try {
      if (groqKey) {
        aiRef.current = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
      } else {
        console.warn("No Groq API key set.");
      }
    } catch (e) {
      console.error(e);
    }
  }, [groqKey]);

  const playClickSound = () => { playSfx("click"); };

  const playSfx = (type: string) => {
    try {
      const a = new Audio(`/sfx/${type}.mp3`);
      a.volume = 0.5;
      a.play().catch(() => {});
    } catch (e) {}
  };

  // Radio controls
  const radioPlay = (trackIdx?: number) => {
    const idx = trackIdx ?? radioTrack;
    if (radioRef.current) { radioRef.current.pause(); radioRef.current = null; }
    const a = new Audio(RADIO_TRACKS[idx].file);
    a.volume = radioVolume;
    a.loop = true;
    a.play().catch(() => {});
    radioRef.current = a;
    setRadioPlaying(true);
    setRadioTrack(idx);
  };
  const radioPause = () => {
    radioRef.current?.pause();
    setRadioPlaying(false);
  };
  const radioSkip = () => {
    const next = (radioTrack + 1) % RADIO_TRACKS.length;
    radioPlay(next);
  };
  const radioSetVol = (v: number) => {
    setRadioVolume(v);
    if (radioRef.current) radioRef.current.volume = v;
  };

  const speakText = async (text: string, voiceId = "JBFqnCBsd6RMkjVDRZzb") => {
    if (!elevenLabsKey) {
      console.warn("No ElevenLabs API key set, skipping TTS");
      return;
    }
    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": elevenLabsKey, "Content-Type": "application/json" },
          body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
        },
      );
      if (!res.ok) throw new Error(`ElevenLabs TTS error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch (e) {
      console.error("ElevenLabs TTS failed, falling back to browser:", e);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Voice mapping: NPC personality id → ElevenLabs voice id
  // Male voices: George, Charlie, James, Callum, Daniel, Liam, Bill
  // Female voices: Sarah, Charlotte, Alice, Lily, Aria, Jessica
  const NPC_VOICES: Record<string, string> = {
    s1: "JBFqnCBsd6RMkjVDRZzb", // George — angry male seller
    s2: "XB0fDUnXU5powFXDhCwa", // Charlotte — forgetful female seller
    s3: "IKne3meq5aSn9XLyUdCD", // Charlie — funny male seller
    s4: "Xb7hH8MSUJpSbSDYk0k2", // Alice — paranoid female seller
    s5: "iP95p4xoKVk53GoZ742B", // Callum — snobby male seller
    s6: "cgSgspJ2msm6clMCkdW9", // Jessica — romantic female seller
    s7: "onwK4e9ZLuTAKqWW03F9", // Daniel — confused male seller
    b1: "N2lVS1w4EtoT3dr4eOWO", // James — grumpy male buyer
    b2: "pFZP5JQG7iQjIQuC4Bku", // Lily — cheerful female buyer
    b3: "TX3LPaxmHKxFdv7VOQHJ", // Liam — suspicious male buyer
    b4: "XB0fDUnXU5powFXDhCwa", // Charlotte — impatient female buyer
    c1: "JBFqnCBsd6RMkjVDRZzb", // George — wealthy male collector
    c2: "cgSgspJ2msm6clMCkdW9", // Jessica — picky female collector
  };
  const EXPERT_VOICES: Record<string, string> = {
    "Dr. Harrison": "N2lVS1w4EtoT3dr4eOWO", // James — deep authoritative
    "Prof. Miller": "onwK4e9ZLuTAKqWW03F9", // Daniel — scholarly
    "Mr. Vance": "iP95p4xoKVk53GoZ742B", // Callum — refined executive
  };

  const getVoiceForNPC = (npcId: string) => NPC_VOICES[npcId] || "JBFqnCBsd6RMkjVDRZzb";

  const spawnNPC = (specificType?: NPCType) => {
    if (activeNPCs.length >= 2) return;

    // Pick side
    const hasLeft = activeNPCs.some((n) => n.position[0] < 0);
    const pos: [number, number, number] = hasLeft
      ? [0.6, 0, 0.5]
      : [-0.6, 0, 0.5];

    const npcDefinition = specificType
      ? getRandomNPCByType(specificType)
      : getRandomCustomer();

    const spawnedItem = spawnItem();
    const baseValue = spawnedItem.baseValue;
    const minPrice = Math.floor(baseValue * 0.7);
    const maxBudget = Math.floor(baseValue * 1.3);
    const rentAmount = Math.floor(Math.random() * 2000) + 2000;

    let storyPrompt = "";
    if (npcDefinition.type === "SELLER") {
      const fakeHint = !spawnedItem.isAuthentic ? " IMPORTANT: This item is actually a FAKE/REPRODUCTION. You do NOT know it's fake (or you're hiding it). Drop subtle clues: be vague about provenance, mix up dates slightly, avoid specific details about the item's history, seem nervous or overly eager to sell quickly." : "";
      const stolenHint = spawnedItem.isStolen ? " IMPORTANT: This item is STOLEN. You are nervous, want to sell fast, avoid questions about where you got it, and get agitated if pressed for documentation." : "";
      storyPrompt = ` You possess a rare/historical item: ${spawnedItem.name} — ${spawnedItem.description} from ${spawnedItem.region}. Category: ${spawnedItem.category}. Make up a creative, fun story about how you acquired it, why you want to sell it, and state your asking price (which should be around $${minPrice}).${fakeHint}${stolenHint}`;
    } else if (
      npcDefinition.type === "BUYER" ||
      npcDefinition.type === "COLLECTOR"
    ) {
      storyPrompt = ` You are looking to buy a rare/historical item: ${spawnedItem.name} — ${spawnedItem.description} from ${spawnedItem.region}. Category: ${spawnedItem.category}. Make up a creative reason why you desperately need it, and state your starting offer (which should be around $${maxBudget}).`;
    }

    // Clone with specific specifics
    const npc: NPCPersonality = {
      ...npcDefinition,
      systemPrompt:
        npcDefinition.systemPrompt
          .replace(/\[ITEM_NAME\]/g, spawnedItem.name)
          .replace(/\[MIN_PRICE\]/g, `$${minPrice}`)
          .replace(/\[MAX_PRICE\]/g, `$${maxBudget}`)
          .replace(/\[RENT_AMOUNT\]/g, `$${rentAmount}`) + storyPrompt,
    };

    const instanceId = Math.random().toString(36).substring(7);

    let session = null;
    if (aiRef.current) {
      session = {
        systemPrompt: npc.systemPrompt,
        messages: [] as { role: "user" | "assistant"; content: string }[],
      };
    }

    const newNPC = {
      id: instanceId,
      npc: npc,
      isLeaving: false,
      chatHistory: [],
      currentLine: "...",
      chatSession: session,
      position: pos,
      item: spawnedItem.name,
      itemData: spawnedItem,
      hasItemBox:
        npc.type === "SELLER" ||
        npc.type === "BUYER" ||
        npc.type === "EXPERT" ||
        npc.type === "COLLECTOR",
    };

    setActiveNPCs((prev) => [...prev, newNPC]);

    // Open door for NPC entry, close after they walk through
    setDoorOpen(true);
    playSfx("door");
    setTimeout(() => playSfx("bell"), 300);
    setTimeout(() => setDoorOpen(false), 2500);

    // Initial greeting after walk
    setTimeout(() => {
      triggerNPCResponse(instanceId, "Hello?", newNPC);
    }, 2000);
  };

  // Auto-spawn: sellers come every 15-25s, walk-in buyers every 40-60s
  useEffect(() => {
    const sellerTimer = setInterval(() => {
      if (activeNPCs.length < 2) spawnNPC("SELLER");
    }, 15000 + Math.random() * 10000);

    const walkinTimer = setInterval(() => {
      if (activeNPCs.length < 2 && Math.random() < 0.4) {
        spawnNPC(Math.random() < 0.7 ? "BUYER" : "COLLECTOR");
      }
    }, 40000 + Math.random() * 20000);

    return () => { clearInterval(sellerTimer); clearInterval(walkinTimer); };
  }, [activeNPCs.length]);

  // Run Ad — pay $100 to attract a buyer
  const runAd = () => {
    if (money < 500) return;
    if (activeNPCs.length >= 2) return;
    setMoney(prev => prev - 500);
    playSfx("click");
    spawnNPC(Math.random() < 0.6 ? "BUYER" : "COLLECTOR");
  };

  const triggerNPCResponse = async (
    id: string,
    prompt: string,
    fallbackNpc: any,
  ) => {
    const npcObj = activeNPCs.find((n) => n.id === id) || fallbackNpc;
    if (!npcObj || !npcObj.chatSession || !aiRef.current) return;

    setIsTyping(true);
    try {
      npcObj.chatSession.messages.push({ role: "user", content: prompt });
      const completion = await aiRef.current.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: npcObj.chatSession.systemPrompt },
          ...npcObj.chatSession.messages,
        ],
      });
      let text = completion.choices[0]?.message?.content || "";
      npcObj.chatSession.messages.push({ role: "assistant", content: text });

      let dealAmount = 0;
      const dealMatch = text.match(/\[ACTION:\s*DEAL\s*\$([\d.]+)\]/i);
      let isDealAction = false;
      if (dealMatch) {
        isDealAction = true;
        dealAmount = parseFloat(dealMatch[1]);
        text = text.replace(/\[ACTION:\s*DEAL\s*\$[\d.]+\]/gi, "").trim();
        playSfx("deal");

        // Update money
        setMoney((prev) => {
          if (npcObj.npc.type === "SELLER") {
            return prev - dealAmount; // We are buying from them
          } else if (
            npcObj.npc.type === "BUYER" ||
            npcObj.npc.type === "COLLECTOR"
          ) {
            return prev + dealAmount; // We are selling to them
          }
          return prev;
        });

        // Add transaction
        setBankTransactions((prev) => [
          {
            id: Date.now(),
            title:
              npcObj.npc.type === "SELLER"
                ? `Purchased: ${npcObj.item}`
                : `Sold: ${npcObj.item}`,
            date: "Just now",
            amount: dealAmount,
            type: npcObj.npc.type === "SELLER" ? "debit" : "credit",
          },
          ...prev,
        ]);

        // Update inventory
        if (npcObj.npc.type === "SELLER") {
          const si = npcObj.itemData;
          const itemEntry = { name: npcObj.item, region: si?.region || "", boughtFor: dealAmount, date: new Date().toLocaleDateString(), image: si ? getCachedImage(si) : undefined, isAuthentic: si?.isAuthentic, isStolen: si?.isStolen, category: si?.category, description: si?.description };
          setInventory(prev => [...prev, itemEntry]);
          setTradeHistory(prev => [{ name: npcObj.item, type: "bought", amount: dealAmount, date: new Date().toLocaleDateString() }, ...prev]);

          // If bought stolen goods — random chance police catch you
          if (si?.isStolen && Math.random() < 0.5) {
            setTimeout(() => { playSfx("error"); setGameOver({ reason: "You purchased stolen property! The police traced the item back to your shop." }); }, 2000);
          }
        } else if (npcObj.npc.type === "BUYER" || npcObj.npc.type === "COLLECTOR") {
          // Check if the item being sold is fake or stolen — GAME OVER
          const soldItem = inventory.find(i => i.name === npcObj.item);
          if (soldItem && soldItem.isAuthentic === false) {
            setTimeout(() => { playSfx("error"); setGameOver({ reason: `You sold a COUNTERFEIT "${npcObj.item}" to a customer. The fraud was discovered and you've been arrested!` }); }, 2000);
          }
          if (soldItem && soldItem.isStolen === true) {
            setTimeout(() => { playSfx("error"); setGameOver({ reason: `You sold STOLEN property "${npcObj.item}". The buyer reported it and police traced it to your shop!` }); }, 2000);
          }
          setInventory(prev => {
            const idx = prev.findIndex(i => i.name === npcObj.item);
            if (idx === -1) return prev;
            return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
          });
          setTradeHistory(prev => [{ name: npcObj.item, type: "sold", amount: dealAmount, date: new Date().toLocaleDateString() }, ...prev]);
        }
      }

      const isLeavingAction = text.includes("[ACTION: LEAVE]") || isDealAction;
      if (text.includes("[ACTION: LEAVE]")) {
        text = text.replace(/\[ACTION:\s*LEAVE\]/gi, "").trim();
      }

      setActiveNPCs((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                currentLine: text,
                chatHistory: [...n.chatHistory, { role: "model", text }],
              }
            : n,
        ),
      );

      if (text) {
        speakText(text, getVoiceForNPC(npcObj.npc.id));
      }

      if (isLeavingAction) {
        dismissNPC(id);
      }
    } catch (e) {
      console.error(e);
      setActiveNPCs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, currentLine: "..." } : n)),
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handlePlayerSpeaks = async (targetId: string) => {
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText("");
    setShowInput(false);

    const obj = activeNPCs.find((n) => n.id === targetId);
    if (obj) {
      setActiveNPCs((prev) =>
        prev.map((n) =>
          n.id === targetId
            ? {
                ...n,
                currentLine: "...",
                chatHistory: [...n.chatHistory, { role: "user", text: msg }],
              }
            : n,
        ),
      );
      await triggerNPCResponse(targetId, msg, obj);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startListening = async () => {
    if (!elevenLabsKey) {
      alert("No ElevenLabs API key set.");
      return;
    }
    if (isListening) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        const blob = new Blob(chunks, { type: "audio/webm" });
        try {
          const form = new FormData();
          form.append("file", blob, "recording.webm");
          form.append("model_id", "scribe_v2");
          const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
            method: "POST",
            headers: { "xi-api-key": elevenLabsKey },
            body: form,
          });
          if (!res.ok) throw new Error(`STT error: ${res.status}`);
          const data = await res.json();
          if (data.text) {
            setInputText(data.text);
            // Auto-send after transcription
            if (selectedNpcId) {
              const msg = data.text.trim();
              if (msg) {
                setInputText("");
                const obj = activeNPCs.find((n) => n.id === selectedNpcId);
                if (obj) {
                  setActiveNPCs((prev) =>
                    prev.map((n) =>
                      n.id === selectedNpcId
                        ? { ...n, currentLine: "...", chatHistory: [...n.chatHistory, { role: "user", text: msg }] }
                        : n,
                    ),
                  );
                  triggerNPCResponse(selectedNpcId, msg, obj);
                }
              }
            }
          }
        } catch (e) {
          console.error("ElevenLabs STT failed:", e);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
    } catch (e) {
      console.error("Mic access denied:", e);
      alert("Microphone access denied.");
    }
  };

  const dismissNPC = (id: string) => {
    setActiveNPCs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isLeaving: true } : n)),
    );
    setDoorOpen(true);
    playSfx("door");
    setTimeout(() => setDoorOpen(false), 2500);
    setTimeout(() => {
      setActiveNPCs((prev) => prev.filter((n) => n.id !== id));
      if (selectedNpcId === id) setSelectedNpcId(null);
    }, 4000);
  };

  // Expert calling system
  const callExpert = async (contactName: string, role: string, fee: number) => {
    setActiveCall({ contact: contactName, status: "ringing", messages: [], fee });
    playSfx("phone");

    // Simulate ring for 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    // 50/50 chance of picking up
    if (Math.random() < 0.5) {
      setActiveCall(prev => prev ? { ...prev, status: "unavailable" } : null);
      setTimeout(() => setActiveCall(null), 2000);
      return;
    }

    // Deduct fee
    setMoney(prev => prev - fee);

    // Get current item being negotiated
    const currentNpc = activeNPCs.find(n => n.id === selectedNpcId) || activeNPCs[0];
    const itemName = currentNpc?.item || "unknown item";
    const itemData = currentNpc?.itemData;

    const systemPrompt = `You are ${contactName}, a ${role}. A pawn shop owner is calling you to ask about an item: "${itemName}"${itemData ? ` — ${itemData.description}. Category: ${itemData.category}, Region: ${itemData.region}.` : "."} ${
      itemData && !itemData.isAuthentic ? "This item is actually a FAKE. Give subtle hints that something seems off — mention inconsistencies in craftsmanship, materials, or dating. Do NOT directly say it's fake, but express professional doubt." :
      itemData && itemData.isStolen ? "This item is actually STOLEN. You may have heard rumors about a recent theft matching this description. Hint at it cautiously." :
      "This item is AUTHENTIC. Confirm its likely authenticity based on your expertise, mention key features to look for."
    } Keep responses to 1-2 sentences. Be professional but characterful.`;

    setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);

    // Get initial greeting from expert
    if (aiRef.current) {
      try {
        const completion = await aiRef.current.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Hi, I need your opinion on a ${itemName} someone brought into my shop.` }],
        });
        const text = completion.choices[0]?.message?.content || "Hello, what can I help with?";
        setActiveCall(prev => prev ? { ...prev, messages: [{ role: "user", content: `About this ${itemName}...` }, { role: "assistant", content: text }] } : null);
        speakText(text, EXPERT_VOICES[contactName] || "JBFqnCBsd6RMkjVDRZzb");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const sendCallMessage = async (msg: string) => {
    if (!activeCall || activeCall.status !== "connected" || !aiRef.current) return;
    const updated = [...activeCall.messages, { role: "user" as const, content: msg }];
    setActiveCall(prev => prev ? { ...prev, messages: updated } : null);

    try {
      const currentNpc = activeNPCs.find(n => n.id === selectedNpcId) || activeNPCs[0];
      const itemData = currentNpc?.itemData;
      const systemPrompt = `You are ${activeCall.contact}, an expert appraiser on a phone call. The pawn shop owner is asking about "${currentNpc?.item || "an item"}". ${
        itemData && !itemData.isAuthentic ? "This item is FAKE. Give subtle professional doubt without directly saying fake." :
        itemData && itemData.isStolen ? "This item may be STOLEN. Hint cautiously." :
        "This item is AUTHENTIC. Confirm authenticity."
      } Keep responses to 1-2 sentences.`;

      const completion = await aiRef.current.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemPrompt }, ...updated],
      });
      const text = completion.choices[0]?.message?.content || "";
      setActiveCall(prev => prev ? { ...prev, messages: [...updated, { role: "assistant", content: text }] } : null);
      speakText(text, EXPERT_VOICES[activeCall.contact] || "JBFqnCBsd6RMkjVDRZzb");
    } catch (e) {
      console.error(e);
    }
  };

  if (onboardingStep === "hero") {
    return (
      <OnboardingHero
        onStart={() => {
          setOnboardingStep("login");
        }}
      />
    );
  }

  if (onboardingStep === "login") {
    return (
      <LoginScreen
        onLogin={(name) => {
          setPlayerName(name);
          setOnboardingStep("levels");
        }}
      />
    );
  }

  if (onboardingStep === "levels") {
    return (
      <LevelSelect
        playerName={playerName}
        onSelectLevel={(level) => {
          setCurrentLevel(level);
          setOnboardingStep("rules");
        }}
      />
    );
  }

  if (onboardingStep === "rules") {
    return (
      <RulesScreen
        onAccept={() => {
          setMoney(onboardingConfig.startingCash);
          setCaptionsEnabled(onboardingConfig.captionsEnabled);
          setOnboardingStep("game");
        }}
      />
    );
  }

  if (onboardingStep === "setup") {
    return (
      <OnboardingSetup
        initialData={onboardingConfig}
        onBack={() => setOnboardingStep("hero")}
        onLaunch={(data) => {
          setOnboardingConfig(data);
          setMoney(data.startingCash);
          setCaptionsEnabled(data.captionsEnabled);
          setOnboardingStep("game");
        }}
      />
    );
  }

  return (
    <div
      className="w-full h-screen overflow-hidden font-sans relative"
      style={{
        touchAction: "none",
        background:
          "radial-gradient(circle at 20% 10%, rgba(255,209,102,0.14) 0%, transparent 30%), radial-gradient(circle at 80% 90%, rgba(255,179,0,0.10) 0%, transparent 25%), linear-gradient(165deg, #25180f 0%, #3b2414 45%, #5a3a1f 100%)",
      }}
    >
      {/* HUD UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
        {/* Money Display */}
        <div className="game-value-chip pointer-events-auto select-none rounded-full px-6 py-2 text-2xl font-bold tracking-wider shadow-lg transition-transform hover:scale-105">
          ${money.toLocaleString()}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* HUD Config toggle */}
          <button
            onClick={() => { playClickSound(); setShowHudConfig(p => !p); }}
            className="game-icon-button rounded-full p-3 shadow-lg transition-all duration-150"
            aria-label="Toggle HUD buttons"
            title="Show/Hide Buttons"
          >
            <LayoutGrid size={22} />
          </button>
          {hudButtons.settings && (
            <button
              onClick={() => { playClickSound(); setIsSettingsOpen(true); }}
              className="game-icon-button rounded-full p-3 shadow-lg transition-all duration-150"
              aria-label="Settings"
            >
              <SettingsIcon size={28} />
            </button>
          )}
        </div>
      </div>

      {isSettingsOpen && (
        <div className="game-overlay pointer-events-auto absolute inset-0 z-20 flex items-center justify-center px-6 py-8">
          <div className="game-menu-shell game-scanlines flex h-full max-h-[620px] w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <aside className="game-menu-sidebar hidden w-64 shrink-0 p-6 md:block">
              <div className="mb-10">
                <div className="game-label">Suvo's Pawnshop</div>
                <h2 className="game-title mt-3 text-4xl tracking-tight">
                  Paused
                </h2>
              </div>

              <nav className="space-y-2">
                <div className="game-menu-tab game-menu-tab-active px-4 py-3 text-sm">
                  Options
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setShowShortcuts(true);
                  }}
                  className="game-menu-tab w-full px-4 py-3 text-left text-sm"
                >
                  Controls
                </button>
                <div className="game-menu-tab px-4 py-3 text-sm opacity-45">
                  Save Game
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(false);
                    setOnboardingStep("levels");
                  }}
                  className="game-menu-tab w-full px-4 py-3 text-left text-sm"
                >
                  Back to Levels
                </button>
              </nav>

              <div className="game-text-dim mt-auto pt-10 text-xs uppercase tracking-[0.2em]">
                Session active
              </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
              <header className="game-menu-header flex items-center justify-between border-b px-6 py-5">
                <div>
                  <div className="game-label">Game Menu</div>
                  <h3 className="game-title mt-1 text-2xl tracking-[0.12em]">
                    Settings
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(false);
                  }}
                  className="game-icon-button p-3"
                  aria-label="Close settings"
                >
                  <X size={22} />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden p-6">
                <div className="game-setting-row p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <label className="game-title text-sm tracking-[0.18em]">
                        Master Volume
                      </label>
                      <p className="game-text-muted mt-1 text-sm">
                        Control music, voices, and interface sounds.
                      </p>
                    </div>
                    <span className="game-value-chip min-w-16 px-3 py-2 text-center text-sm">
                      80
                    </span>
                  </div>
                  <input
                    type="range"
                    className="w-full cursor-pointer accent-[#d7aa55]"
                    defaultValue="80"
                  />
                </div>

                <div className="game-setting-row flex items-center justify-between gap-6 p-5">
                  <div>
                    <label className="game-title text-sm tracking-[0.18em]">
                      Captions
                    </label>
                    <p className="game-text-muted mt-1 text-sm">
                      Display character dialogue over NPCs.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={captionsEnabled}
                      onChange={(e) => {
                        playClickSound();
                        setCaptionsEnabled(e.target.checked);
                      }}
                    />
                    <div className="game-toggle-track h-8 w-16 transition-colors after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:transition-transform after:content-[''] peer-checked:after:translate-x-8"></div>
                  </label>
                </div>

                <div className="game-setting-row p-5">
                  <label className="game-title mb-3 block text-sm tracking-[0.18em]">
                    Graphics Quality
                  </label>
                  <select className="game-select w-full p-3 text-sm">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    setShowShortcuts(true);
                  }}
                  className="game-button w-full px-5 py-4 text-left text-sm"
                >
                  Keyboard Shortcuts
                </button>

                <div className="game-setting-row p-5">
                  <label className="game-title mb-1 block text-sm tracking-[0.18em]">
                    Groq API Key
                  </label>
                  <p className="game-text-muted mb-3 text-xs">
                    Optional — override the default key with your own.
                  </p>
                  <input
                    type="password"
                    className="game-input w-full p-3 text-sm"
                    placeholder="gsk_..."
                    value={userGroqKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      setUserGroqKey(v);
                      if (v) localStorage.setItem("userGroqKey", v);
                      else localStorage.removeItem("userGroqKey");
                    }}
                  />
                </div>

                <div className="game-setting-row p-5">
                  <label className="game-title mb-1 block text-sm tracking-[0.18em]">
                    ElevenLabs API Key
                  </label>
                  <p className="game-text-muted mb-3 text-xs">
                    Optional — override the default key with your own.
                  </p>
                  <input
                    type="password"
                    className="game-input w-full p-3 text-sm"
                    placeholder="xi_..."
                    value={userElevenLabsKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      setUserElevenLabsKey(v);
                      if (v) localStorage.setItem("userElevenLabsKey", v);
                      else localStorage.removeItem("userElevenLabsKey");
                    }}
                  />
                </div>
              </div>

              <footer className="game-menu-footer flex items-center justify-between border-t px-6 py-5">
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(false);
                    setOnboardingStep("levels");
                  }}
                  className="game-button px-4 py-2 text-xs"
                >
                  Back to Levels
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsSettingsOpen(false);
                  }}
                  className="game-button-primary px-8 py-3 text-sm"
                >
                  Resume
                </button>
              </footer>
            </section>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryOpen && (
        <div
          className="game-overlay pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsInventoryOpen(false)}
        >
          <div
            className="game-menu-shell w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-menu-header flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-4">
                <Package size={28} className="text-[#ffcc4d]" />
                <span className="game-title text-2xl uppercase tracking-widest">Inventory</span>
              </div>
              <button onClick={() => setIsInventoryOpen(false)} className="game-icon-button p-3 rounded-xl">
                <X size={22} />
              </button>
            </div>
            <div className="px-6 pt-5 pb-2">
              <input
                className="game-input w-full px-5 py-3 rounded-xl text-base"
                placeholder="Search items..."
                value={inventorySearch}
                onChange={e => setInventorySearch(e.target.value)}
              />
            </div>
            <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{maxHeight: "62vh"}}>
              {inventory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).length === 0 && tradeHistory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Package size={72} className="text-[#c79f60] opacity-40" />
                  <p className="game-text-dim text-base uppercase tracking-widest">No items found</p>
                </div>
              ) : (
                <>
                  {inventory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).length > 0 && (
                    <>
                      <div className="game-text-dim text-xs uppercase tracking-widest mb-3">In Stock</div>
                      <div className="grid grid-cols-2 gap-5 mb-8">
                        {inventory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).map((item, i) => (
                          <div key={i} className="game-panel flex items-center justify-between px-8 py-8 rounded-2xl min-h-[160px]">
                            <div>
                              <div className="game-label text-lg font-bold">{item.name}</div>
                              <div className="game-text-dim text-sm mt-2">{item.date}</div>
                              <div className="game-text-muted text-xs mt-1 uppercase tracking-wide">Paid</div>
                            </div>
                            <div className="game-value-chip text-base px-5 py-3 rounded-xl font-bold">
                              ${item.boughtFor.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {tradeHistory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).length > 0 && (
                    <>
                      <div className="game-text-dim text-xs uppercase tracking-widest mb-3">Trade History</div>
                      <div className="grid grid-cols-2 gap-5">
                        {tradeHistory.filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase())).map((item, i) => (
                          <div key={i} className="game-panel flex items-center justify-between px-8 py-8 rounded-2xl min-h-[160px]" style={{opacity: 0.85}}>
                            <div>
                              <div className="game-label text-lg font-bold">{item.name}</div>
                              <div className="game-text-dim text-sm mt-2">{item.date}</div>
                              <div className="text-xs mt-1 uppercase tracking-wide font-bold" style={{color: item.type === "sold" ? "var(--game-success)" : "var(--game-accent)"}}>
                                {item.type === "sold" ? "▲ Sold" : "▼ Bought"}
                              </div>
                            </div>
                            <div className="text-base px-5 py-3 rounded-xl font-bold" style={{
                              background: item.type === "sold" ? "rgba(87,209,99,0.15)" : "rgba(255,204,77,0.12)",
                              color: item.type === "sold" ? "var(--game-success)" : "var(--game-accent)",
                              border: `1px solid ${item.type === "sold" ? "var(--game-success)" : "var(--game-border)"}`,
                            }}>
                              ${item.amount.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="game-menu-footer border-t p-5 flex justify-between items-center">
              <span className="game-text-muted text-sm uppercase tracking-widest">{inventory.length} item{inventory.length !== 1 ? "s" : ""} in stock</span>
              <span className="game-text-accent text-base font-bold">
                Total: ${inventory.reduce((s, i) => s + i.boughtFor, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL COMPLETE */}
      {levelComplete && (
        <div className="game-overlay pointer-events-auto absolute inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)" }}>
          <div className="w-full max-w-lg text-center animate-in fade-in zoom-in duration-300">
            <div className="text-7xl mb-4">🏆</div>
            <h2
              className="uppercase mb-2 select-none"
              style={{
                fontFamily: "'Impact', 'Arial Black', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                color: "var(--game-accent)",
                textShadow: "0 0 30px rgba(255,204,77,0.5), 0 4px 12px rgba(0,0,0,0.8)",
                letterSpacing: "0.08em",
              }}
            >
              Level Complete
            </h2>
            <p className="game-text-muted text-base mb-8 uppercase tracking-widest">Level {currentLevel} cleared</p>

            <div
              className="game-panel p-5 mb-8 text-left space-y-3 mx-auto max-w-xs"
              style={{ border: "2px solid var(--game-border)" }}
            >
              <div className="flex justify-between"><span className="game-text-dim text-sm">Money</span><span className="game-text-accent font-bold">${money.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="game-text-dim text-sm">Deals Made</span><span className="game-text-accent font-bold">{tradeHistory.length}</span></div>
              <div className="flex justify-between"><span className="game-text-dim text-sm">Inventory Value</span><span className="game-text-accent font-bold">${inventory.reduce((s, i) => s + i.boughtFor, 0).toLocaleString()}</span></div>
            </div>

            <div className="flex flex-col gap-3 items-center">
              {currentLevel < 5 && (
                <button
                  className="game-button-primary px-12 py-4 uppercase tracking-[0.2em] font-black"
                  style={{ fontFamily: "'Impact', 'Arial Black', sans-serif", fontSize: "1.3rem" }}
                  onClick={() => {
                    const next = currentLevel + 1;
                    localStorage.setItem(`pawn-level-${playerName}`, String(next));
                    setLevelComplete(false);
                    setOnboardingStep("levels");
                  }}
                >
                  Next Level
                </button>
              )}
              <button
                className="game-button px-10 py-3 uppercase tracking-wider text-sm"
                onClick={() => {
                  setLevelComplete(false);
                  setOnboardingStep("levels");
                }}
              >
                Back to Levels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER — JAILED */}
      {gameOver && (
        <div className="game-overlay pointer-events-auto absolute inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
          <div className="game-menu-shell w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 text-center">
            <div className="p-8">
              <div className="text-6xl mb-4">🚔</div>
              <h2 className="game-title text-4xl tracking-widest mb-2" style={{ color: "var(--game-danger)" }}>BUSTED</h2>
              <p className="game-text-muted text-base mb-6">{gameOver.reason}</p>
              <div className="game-panel p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between"><span className="game-text-dim text-sm">Money Earned</span><span className="game-text-accent font-bold">${money.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="game-text-dim text-sm">Items Traded</span><span className="game-text-accent font-bold">{tradeHistory.length}</span></div>
                <div className="flex justify-between"><span className="game-text-dim text-sm">Inventory Value</span><span className="game-text-accent font-bold">${inventory.reduce((s, i) => s + i.boughtFor, 0).toLocaleString()}</span></div>
              </div>
              <button onClick={() => { setGameOver(null); setOnboardingStep("levels"); }} className="game-button-primary px-10 py-4 text-lg">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL OVERLAY */}
      {activeCall && (
        <div className="game-overlay pointer-events-auto absolute inset-0 z-[90] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div className="game-menu-shell w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--game-surface-panel)] flex items-center justify-center mx-auto mb-3 text-2xl font-bold" style={{ color: "var(--game-accent)" }}>
                {activeCall.contact.charAt(0)}
              </div>
              <h3 className="game-title text-xl tracking-widest">{activeCall.contact}</h3>
              <p className="game-text-dim text-sm mt-1">
                {activeCall.status === "ringing" ? "📞 Ringing..." : activeCall.status === "unavailable" ? "❌ No answer — unavailable" : activeCall.status === "connected" ? `🟢 Connected · $${activeCall.fee} charged` : "Call ended"}
              </p>
            </div>
            {activeCall.status === "connected" && (
              <div className="px-6 pb-4">
                <div className="space-y-3 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden mb-4">
                  {activeCall.messages.map((m, i) => (
                    <div key={i} className={`text-sm p-3 rounded-xl ${m.role === "assistant" ? "game-panel" : "bg-[var(--game-surface-raised)]"}`}>
                      <span className="game-text-dim text-xs block mb-1">{m.role === "assistant" ? activeCall.contact : "You"}</span>
                      <span className="game-text-muted">{m.content}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="game-input flex-1 p-3 text-sm"
                    placeholder="Ask about the item..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        sendCallMessage((e.target as HTMLInputElement).value.trim());
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button onClick={() => setActiveCall(null)} className="game-button px-4 py-3 text-sm" style={{ color: "var(--game-danger)" }}>
                    Hang Up
                  </button>
                </div>
              </div>
            )}
            {(activeCall.status === "unavailable" || activeCall.status === "ringing") && (
              <div className="px-6 pb-6 text-center">
                {activeCall.status === "ringing" && <div className="game-text-dim text-sm animate-pulse">Waiting for answer...</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {showShortcuts && (
        <div
          className="game-overlay pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="game-menu-shell w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="game-menu-header flex items-center justify-between border-b p-4">
              <h2 className="game-title text-xl tracking-widest">
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => {
                  playClickSound();
                  setShowShortcuts(false);
                }}
                className="game-icon-button p-2"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="game-shortcut-row">
                <span>Wait for Seller</span>
                <kbd className="game-shortcut-key">Space</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Toggle Phone</span>
                <kbd className="game-shortcut-key">P</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Open Market App</span>
                <kbd className="game-shortcut-key">M</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Open Bank App</span>
                <kbd className="game-shortcut-key">B</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Open Camera App</span>
                <kbd className="game-shortcut-key">C</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Open Messages App</span>
                <kbd className="game-shortcut-key">I</kbd>
              </div>
              <div className="game-shortcut-row">
                <span>Close Modals / Apps</span>
                <kbd className="game-shortcut-key">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NPC Interaction — inline chat bar */}
      <div className="absolute bottom-8 left-0 w-full px-8 pointer-events-none flex flex-col items-center gap-3 z-10">
        {activeNPCs.map((n) => (
          <div
            key={n.id}
            className="w-full max-w-2xl pointer-events-auto"
          >
            {!n.isLeaving && (
              <div
                className="flex items-center gap-2 rounded-2xl p-2"
                style={{ background: 'linear-gradient(135deg, var(--game-surface) 0%, var(--game-surface-raised) 100%)', border: '2px solid var(--game-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              >
                <input
                  type="text"
                  value={selectedNpcId === n.id ? inputText : ''}
                  onFocus={() => setSelectedNpcId(n.id)}
                  onChange={(e) => { setSelectedNpcId(n.id); setInputText(e.target.value); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      setSelectedNpcId(n.id);
                      handlePlayerSpeaks(n.id);
                    }
                  }}
                  className="game-input flex-1 px-4 py-2.5 text-sm rounded-xl"
                  style={{ border: '1px solid var(--game-border)', background: 'var(--game-bg-1)' }}
                  placeholder={`Talk to ${n.personality?.name || 'NPC'}...`}
                />
                {/* Send button */}
                <button
                  onClick={() => { playClickSound(); setSelectedNpcId(n.id); handlePlayerSpeaks(n.id); }}
                  className="game-button-primary px-4 py-2.5 text-sm rounded-xl transition-all duration-150 hover:scale-105 active:scale-90"
                  title="Send"
                >
                  Send
                </button>
                {/* Mic button */}
                <button
                  onClick={() => { playClickSound(); setSelectedNpcId(n.id); startListening(); }}
                  className={`${isListening && selectedNpcId === n.id ? "bg-red-600 hover:bg-red-700 text-white border-red-500" : "game-button text-[#fff2cf]"} px-3 py-2.5 text-sm rounded-xl transition-all duration-150 hover:scale-105 active:scale-90 flex items-center gap-1.5`}
                  style={!(isListening && selectedNpcId === n.id) ? { border: '1px solid var(--game-border)' } : {}}
                  title={isListening && selectedNpcId === n.id ? "Stop recording" : "Hold to speak"}
                >
                  {isListening && selectedNpcId === n.id ? (
                    <><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Stop</>
                  ) : (
                    <>🎤 Mic</>
                  )}
                </button>
                {/* Dismiss button */}
                <button
                  onClick={() => { playClickSound(); dismissNPC(n.id); }}
                  className="game-button px-3 py-2.5 text-sm rounded-xl text-[#ef4444] transition-all duration-150 hover:scale-105 active:scale-90"
                  style={{ border: '1px solid var(--game-danger)' }}
                  title="Dismiss NPC"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inventory Button */}
      {hudButtons.inventory && (
      <div className="absolute bottom-8 left-8 z-40 pointer-events-auto">
        <button
          onClick={() => { playClickSound(); setIsInventoryOpen(true); }}
          className="game-icon-button p-4 rounded-3xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 active:opacity-80 flex items-center justify-center gap-2 text-[#ffd877] relative group"
        >
          <Package size={32} />
          {inventory.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#ffcc4d] text-[#25180f] text-[10px] font-black flex items-center justify-center">
              {inventory.length}
            </span>
          )}
          <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all game-value-chip text-xs px-2 py-1 rounded whitespace-nowrap">
            Inventory
          </span>
        </button>
      </div>
      )}

      {/* Phone Button & Other Controls */}
      <div className="absolute bottom-8 right-8 z-40 pointer-events-auto flex flex-col items-end gap-3">
        <div className="flex gap-3 items-center">
          {hudButtons.waitSeller && !isPhoneOpen && activeNPCs.length < 2 && (
              <button
                id="btn-wait-customer"
                onClick={() => {
                  playClickSound();
                  spawnNPC("SELLER");
                }}
                className="game-icon-button p-4 rounded-3xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 active:opacity-80 flex items-center justify-center group relative text-[#ffd877]"
              >
                <Clock size={32} />
                <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all game-value-chip text-xs px-2 py-1 rounded whitespace-nowrap">
                  Wait for Seller
                </span>
              </button>
          )}
          {hudButtons.runAd && !isPhoneOpen && activeNPCs.length < 2 && (
              <button
                onClick={runAd}
                className={`game-icon-button p-4 rounded-3xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 active:opacity-80 flex items-center justify-center group relative ${money >= 500 ? "text-[#57d163]" : "text-[#c79f60] opacity-50"}`}
              >
                <Megaphone size={32} />
                <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all game-value-chip text-xs px-2 py-1 rounded whitespace-nowrap">
                  Run Ad · $500
                </span>
              </button>
          )}
          {hudButtons.phone && (
          <button
            onClick={() => {
              playClickSound();
              setIsPhoneOpen((prev) => !prev);
              if (isPhoneOpen) setPhoneApp(null);
            }}
            className="game-icon-button p-4 rounded-3xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 active:opacity-80 flex items-center justify-center text-[#fff2cf]"
          >
            {isPhoneOpen ? (
              <X size={32} className="text-red-500" />
            ) : (
              <Smartphone size={32} className="text-[#5fbc5f]" />
            )}
          </button>
          )}
        </div>
      </div>

      {/* HUD Button Config Panel */}
      {showHudConfig && (
        <div className="absolute top-16 right-4 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="game-menu-shell p-4 w-56 shadow-2xl" style={{ border: '2px solid var(--game-border)' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="game-label text-sm">HUD Buttons</span>
              <button onClick={() => setShowHudConfig(false)} className="game-icon-button p-1 rounded">
                <X size={16} />
              </button>
            </div>
            {([
              ['inventory', 'Inventory', Package],
              ['phone', 'Phone', Smartphone],
              ['waitSeller', 'Wait for Seller', Clock],
              ['runAd', 'Run Ad', Megaphone],
              ['settings', 'Settings', SettingsIcon],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => { playClickSound(); setHudButtons(p => ({ ...p, [key]: !p[key as keyof typeof p] })); }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-100 hover:bg-white/5"
              >
                <Icon size={18} style={{ color: hudButtons[key as keyof typeof hudButtons] ? 'var(--game-accent)' : 'var(--game-text-dim)' }} />
                <span className="flex-1 text-left text-sm" style={{ color: 'var(--game-text)', fontFamily: 'Bungee' }}>{label}</span>
                <div
                  className="w-9 h-5 rounded-full transition-all duration-150 relative"
                  style={{ background: hudButtons[key as keyof typeof hudButtons] ? 'var(--game-accent)' : 'var(--game-surface-raised)' }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-150"
                    style={{ left: hudButtons[key as keyof typeof hudButtons] ? '18px' : '2px' }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Radio Close-up UI */}
      {radioOpen && (
        <div className="game-overlay absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto" onClick={() => setRadioOpen(false)}>
          <div
            className="game-menu-shell p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{ border: '2px solid var(--game-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio size={22} style={{ color: 'var(--game-accent)' }} />
                <span className="game-title text-xl">Pawn Radio</span>
              </div>
              <button onClick={() => setRadioOpen(false)} className="game-icon-button p-1.5 rounded">
                <X size={18} />
              </button>
            </div>

            {/* Track display */}
            <div className="rounded-xl p-4 mb-4 text-center" style={{ background: 'var(--game-bg-1)', border: '1px solid var(--game-border)' }}>
              <div className="game-text-dim text-xs mb-1" style={{ fontFamily: 'Bungee' }}>NOW PLAYING</div>
              <div className="text-lg font-bold" style={{ color: 'var(--game-accent)', fontFamily: 'Bungee' }}>
                {radioPlaying ? RADIO_TRACKS[radioTrack].name : "— Off —"}
              </div>
              <div className="game-text-dim text-xs mt-1">Track {radioTrack + 1} / {RADIO_TRACKS.length}</div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <button
                onClick={() => { playClickSound(); radioPlaying ? radioPause() : radioPlay(); }}
                className="game-button-primary p-4 rounded-full transition-all duration-150 hover:scale-110 active:scale-90"
              >
                {radioPlaying ? <PauseIcon size={28} /> : <Play size={28} />}
              </button>
              <button
                onClick={() => { playClickSound(); radioSkip(); }}
                className="game-button p-3 rounded-full transition-all duration-150 hover:scale-110 active:scale-90"
              >
                <SkipForward size={22} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mb-4">
              <Volume2 size={18} style={{ color: 'var(--game-text-dim)' }} />
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={radioVolume}
                onChange={(e) => radioSetVol(parseFloat(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: 'var(--game-accent)', background: 'var(--game-surface-raised)' }}
              />
              <span className="text-xs w-8 text-right" style={{ color: 'var(--game-text-muted)', fontFamily: 'Bungee' }}>
                {Math.round(radioVolume * 100)}
              </span>
            </div>

            {/* Track list */}
            <div className="flex flex-col gap-1">
              {RADIO_TRACKS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { playClickSound(); radioPlay(i); }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-100 hover:bg-white/5 text-left"
                  style={i === radioTrack && radioPlaying ? { background: 'rgba(213,162,77,0.15)', border: '1px solid var(--game-border)' } : { border: '1px solid transparent' }}
                >
                  <span className="w-5 text-center text-xs" style={{ color: 'var(--game-text-dim)', fontFamily: 'Bungee' }}>{i + 1}</span>
                  <span className="flex-1 text-sm" style={{ color: i === radioTrack && radioPlaying ? 'var(--game-accent)' : 'var(--game-text)', fontFamily: 'Bungee' }}>
                    {t.name}
                  </span>
                  {i === radioTrack && radioPlaying && (
                    <span className="flex gap-0.5">
                      <span className="w-1 h-3 rounded-full animate-pulse" style={{ background: 'var(--game-accent)', animationDelay: '0ms' }} />
                      <span className="w-1 h-4 rounded-full animate-pulse" style={{ background: 'var(--game-accent)', animationDelay: '150ms' }} />
                      <span className="w-1 h-2 rounded-full animate-pulse" style={{ background: 'var(--game-accent)', animationDelay: '300ms' }} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-3 text-center">
              <span className="game-text-dim text-[10px]" style={{ fontFamily: 'Bungee' }}>♪ MADE WITH ELEVENLABS ♪</span>
            </div>
          </div>
        </div>
      )}

      {/* Phone Interface */}
      {isPhoneOpen && (
        <div className="absolute inset-0 z-30 flex items-center justify-end pr-[10%] p-4 bg-black/50 backdrop-blur-sm pointer-events-auto">
          <div className="relative group animate-in fade-in zoom-in-95 duration-200">
            {/* Hardware Buttons */}
            <div className="absolute -left-2 top-[120px] w-2 h-12 bg-zinc-800 rounded-l-md border border-r-0 border-white/10 shadow-inner"></div>
            <div className="absolute -left-2 top-[180px] w-2 h-12 bg-zinc-800 rounded-l-md border border-r-0 border-white/10 shadow-inner"></div>

            <div
              className="w-[320px] h-[650px] rounded-[3rem] border-[8px] border-[#1C1C1E] shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_0_2px_rgba(255,255,255,0.1)] relative overflow-hidden flex flex-col bg-black/90"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1080&auto=format&fit=crop)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
              {/* Notch / Dynamic Island */}
              <div className={`absolute top-0 left-0 right-0 z-20 ${phoneApp ? "bg-black" : ""}`}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-white/10 mr-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"></div>
                </div>

              {/* Status Bar */}
              <div
                className="flex justify-between items-center px-6 py-3 text-white/90 z-10 font-bold font-sans drop-shadow-md tracking-wide"
                style={{ fontSize: "13px" }}
              >
                <span className="mt-0.5 ml-2">{currentTime}</span>
                <div className="flex items-center gap-[6px] mr-1">
                  <div className="flex gap-[2px] items-end h-[10px] pb-[1px]">
                    <div className="w-[3px] h-[40%] bg-white rounded-[1px]"></div>
                    <div className="w-[3px] h-[60%] bg-white rounded-[1px]"></div>
                    <div className="w-[3px] h-[80%] bg-white rounded-[1px]"></div>
                    <div className="w-[3px] h-full bg-white rounded-[1px]"></div>
                  </div>
                  <span className="font-bold text-[12px] tracking-tighter">
                    5G
                  </span>
                  <div className="w-[22px] h-[11px] rounded-[3px] border-[1px] border-white/90 flex justify-start p-[1.5px] relative">
                    <div className="w-[80%] h-full bg-white/90 rounded-[1px]"></div>
                    <div className="w-[1.5px] h-[4px] bg-white/90 absolute -right-[2.5px] top-1/2 -translate-y-1/2 rounded-r-sm shadow-none"></div>
                  </div>
                </div>
              </div>
              </div>

              {/* Content */}
              <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
                {!phoneApp ? (
                  <div className="flex-1 flex flex-col justify-between pt-14 pb-6 px-4">
                    {/* Grid Apps */}
                    <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                      {[
                        {
                          name: "Market",
                          icon: ShoppingBag,
                          color: "bg-gradient-to-b from-[#FFCC00] to-[#FF9500]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("market");
                          },
                        },
                        {
                          name: "Bank",
                          icon: Landmark,
                          color: "bg-gradient-to-b from-[#5AC8FA] to-[#007AFF]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("bank");
                          },
                        },
                        {
                          name: "ElevenLabs",
                          icon: Pause,
                          color: "bg-[#1C1C1E] border border-white/10",
                          link: "https://elevenlabs.io",
                        },
                      ].map((app, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >
                          {app.link ? (
                            <a
                              href={app.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-14 h-14 ${app.color} rounded-[14px] flex items-center justify-center text-white shadow-md active:scale-75 active:opacity-60 transition-all duration-150`}
                              onClick={playClickSound}
                            >
                              <app.icon
                                size={26}
                                strokeWidth={1.5}
                                className={app.iconColor || ""}
                              />
                            </a>
                          ) : (
                            <button
                              onClick={app.action}
                              className={`w-14 h-14 ${app.color} rounded-[14px] flex items-center justify-center text-white shadow-md active:scale-75 active:opacity-60 transition-all duration-150`}
                            >
                              <app.icon
                                size={26}
                                strokeWidth={1.5}
                                className={app.iconColor || ""}
                              />
                            </button>
                          )}
                          <span className="text-white drop-shadow-md text-[10px] font-medium tracking-wide">
                            {app.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dock */}
                    <div className="bg-white/25 backdrop-blur-2xl rounded-[24px] px-3 py-2 flex justify-between shadow-lg mx-auto w-full max-w-[96%] border border-white/20 mb-2 gap-1">
                      {[
                        {
                          name: "Phone",
                          icon: PhoneCall,
                          color: "bg-gradient-to-b from-[#4CD964] to-[#34C759]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("contacts");
                          },
                        },
                        {
                          name: "Messages",
                          icon: MessageCircle,
                          color: "bg-gradient-to-b from-[#4CD964] to-[#34C759]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("messages");
                          },
                        },
                        {
                          name: "Camera",
                          icon: Camera,
                          color: "bg-[#eeeeee]",
                          iconColor: "text-[#1C1C1E]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("camera");
                          },
                        },
                        {
                          name: "Settings",
                          icon: SettingsIcon,
                          color: "bg-gradient-to-b from-[#B8B8B8] to-[#8E8E93]",
                          action: () => {
                            playClickSound();
                            setPhoneApp("settings");
                          },
                        },
                      ].map((app, i) => (
                        <button
                          key={i}
                          onClick={app.action}
                          className={`w-[44px] h-[44px] ${app.color} rounded-[12px] flex items-center justify-center text-white shadow-sm active:scale-75 active:opacity-60 transition-all duration-150`}
                        >
                          <app.icon size={22} strokeWidth={1.5} className={(app as any).iconColor || ""} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : phoneApp === "bank" ? (
                  <div className="bg-black text-white absolute inset-0 z-20 flex flex-col pt-14">
                    <div className="px-6 pb-6 pt-4 bg-gradient-to-b from-[#0A84FF]/20 to-black/0 border-b border-white/5">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                          Bank
                        </h2>
                        <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center border border-white/10 shadow-sm">
                          <Landmark size={20} className="text-[#0A84FF]" />
                        </div>
                      </div>
                      <div className="mb-2 text-white/50 text-sm font-medium">
                        Available Balance
                      </div>
                      <div className="text-5xl font-mono tracking-tighter mb-1">
                        ${money.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden bg-black px-6 pt-6 pb-12">
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                        Recent Activity
                      </h3>
                      <div className="flex flex-col gap-4">
                        {bankTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex justify-between items-center group cursor-pointer active:scale-95 transition-transform duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border p-0.5 ${tx.type === "credit" ? "bg-[#34C759]/10 border-[#34C759]/20 text-[#34C759]" : "bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]"}`}
                              >
                                {tx.type === "credit" ? (
                                  <ArrowDownLeft size={18} strokeWidth={2.5} />
                                ) : (
                                  <ArrowUpRight size={18} strokeWidth={2.5} />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-[15px]">
                                  {tx.title}
                                </div>
                                <div className="text-xs text-white/50">
                                  {tx.date}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`font-mono text-[15px] font-medium ${tx.type === "credit" ? "text-[#34C759]" : "text-white"}`}
                            >
                              {tx.type === "credit" ? "+" : "-"}$
                              {tx.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : phoneApp === "market" ? (
                  <div className="bg-[#1C1C1E] text-white absolute inset-0 z-20 flex flex-col pt-14">
                    <div className="px-5 pb-3 pt-2">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight text-[#FFCC00]">
                          Market
                        </h2>
                        <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform">
                          <PlusCircle size={18} />
                        </button>
                      </div>
                      {/* Tabs */}
                      <div className="flex p-0.5 bg-black/40 rounded-lg">
                        <button
                          onClick={() => {
                            playClickSound();
                            setMarketTab("feed");
                          }}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${marketTab === "feed" ? "bg-[#3A3A3C] text-white shadow" : "text-white/50 hover:text-white"}`}
                        >
                          Global Feed
                        </button>
                        <button
                          onClick={() => {
                            playClickSound();
                            setMarketTab("my_items");
                          }}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${marketTab === "my_items" ? "bg-[#3A3A3C] text-white shadow" : "text-white/50 hover:text-white"}`}
                        >
                          My Listings
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pb-12 pt-2 gap-3 flex flex-col">
                      {marketTab === "feed"
                        ? marketFeed.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#2C2C2E] p-4 rounded-2xl flex flex-col gap-2 shadow-sm border border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-[15px]">
                                    {item.name}
                                  </h4>
                                  <div className="text-xs text-[#FFCC00]/80 mt-0.5">
                                    {item.seller}
                                  </div>
                                </div>
                                <div className="px-2 py-1 bg-black/40 rounded text-[10px] font-bold text-white/70">
                                  {item.condition}
                                </div>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <div className="text-lg font-mono font-bold">
                                  ${item.price.toLocaleString()}
                                </div>
                                <button className="px-4 py-1.5 bg-[#FFCC00] hover:bg-[#E5B800] text-black text-xs font-bold rounded-full transition-colors active:scale-95 shadow-sm">
                                  Buy
                                </button>
                              </div>
                            </div>
                          ))
                        : myMarketItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-[#2C2C2E] p-4 rounded-2xl flex flex-col gap-2 shadow-sm border border-white/5 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-[15px]">
                                  {item.name}
                                </h4>
                                <div
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === "sold" ? "bg-[#34C759]/20 text-[#34C759]" : "bg-[#0A84FF]/20 text-[#0A84FF]"}`}
                                >
                                  {item.status}
                                </div>
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <div className="text-lg font-mono font-bold">
                                  ${item.price.toLocaleString()}
                                </div>
                                {item.status === "sold" ? (
                                  <button className="px-4 py-1.5 bg-[#34C759] text-black text-xs font-bold rounded-full shadow-sm">
                                    Claim
                                  </button>
                                ) : (
                                  <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-full transition-colors active:scale-95">
                                    Edit / Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      <div className="h-6"></div> {/* Bottom spacer */}
                    </div>
                  </div>
                ) : phoneApp === "messages" ? (
                  <div className="bg-black text-white absolute inset-0 z-20 flex flex-col pt-14">
                    {messagesAppActiveChat === null ? (
                      <>
                        <div className="px-6 pb-4 border-b border-white/10 flex justify-between items-center">
                          <h2 className="text-3xl font-bold tracking-tight">
                            Messages
                          </h2>
                          <button className="text-[#0A84FF] font-medium">
                            Edit
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                          {messagesData.map((chat) => (
                            <div
                              key={chat.id}
                              className="flex items-center gap-4 px-6 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                              onClick={() => setMessagesAppActiveChat(chat.id)}
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl">
                                {chat.name.charAt(0)}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline mb-1">
                                  <h4 className="font-semibold">{chat.name}</h4>
                                  <span className="text-xs text-white/50">
                                    {chat.time}
                                  </span>
                                </div>
                                <p className="text-sm text-white/60 truncate">
                                  {chat.history[chat.history.length - 1].text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col pt-2">
                        <div className="px-4 pb-2 border-b border-white/10 flex items-center gap-3">
                          <button
                            onClick={() => setMessagesAppActiveChat(null)}
                            className="text-[#0A84FF] flex items-center gap-1 active:opacity-70"
                          >
                            <ChevronLeft size={24} />{" "}
                            <span className="mb-0.5">Back</span>
                          </button>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                            {messagesData
                              .find((c) => c.id === messagesAppActiveChat)
                              ?.name.charAt(0)}
                          </div>
                          <span className="font-semibold">
                            {
                              messagesData.find(
                                (c) => c.id === messagesAppActiveChat,
                              )?.name
                            }
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-4 space-y-3">
                          {messagesData
                            .find((c) => c.id === messagesAppActiveChat)
                            ?.history.map((msg, i) => (
                              <div
                                key={i}
                                className={`max-w-[75%] rounded-2xl px-4 py-2 text-[15px] leading-snug ${msg.sender === "me" ? "bg-[#0A84FF] self-end ml-auto text-white" : "bg-[#1C1C1E] self-start text-white/90"}`}
                              >
                                {msg.text}
                              </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10 flex items-end gap-2 bg-[#1C1C1E]/50 mb-4">
                          <input
                            type="text"
                            value={messagesInput}
                            onChange={(e) => setMessagesInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && messagesInput.trim()) {
                                const cId = messagesAppActiveChat;
                                setMessagesData((prev) =>
                                  prev.map((c) =>
                                    c.id === cId
                                      ? {
                                          ...c,
                                          history: [
                                            ...c.history,
                                            {
                                              sender: "me",
                                              text: messagesInput.trim(),
                                            },
                                          ],
                                          time: "Just now",
                                        }
                                      : c,
                                  ),
                                );
                                setMessagesInput("");
                                setTimeout(() => {
                                  setMessagesData((prev) =>
                                    prev.map((c) =>
                                      c.id === cId
                                        ? {
                                            ...c,
                                            history: [
                                              ...c.history,
                                              {
                                                sender: "him",
                                                text: "Haha okay!",
                                              },
                                            ],
                                            time: "Just now",
                                          }
                                        : c,
                                    ),
                                  );
                                }, 1500);
                              }
                            }}
                            className="flex-1 bg-[#1C1C1E] rounded-full border border-white/20 px-4 py-2 text-sm outline-none w-full"
                            placeholder="iMessage"
                          />
                          <button
                            disabled={!messagesInput.trim()}
                            onClick={() => {
                              const cId = messagesAppActiveChat;
                              setMessagesData((prev) =>
                                prev.map((c) =>
                                  c.id === cId
                                    ? {
                                        ...c,
                                        history: [
                                          ...c.history,
                                          {
                                            sender: "me",
                                            text: messagesInput.trim(),
                                          },
                                        ],
                                        time: "Just now",
                                      }
                                    : c,
                                ),
                              );
                              setMessagesInput("");
                              setTimeout(() => {
                                setMessagesData((prev) =>
                                  prev.map((c) =>
                                    c.id === cId
                                      ? {
                                          ...c,
                                          history: [
                                            ...c.history,
                                            { sender: "him", text: "Got it!" },
                                          ],
                                          time: "Just now",
                                        }
                                      : c,
                                  ),
                                );
                              }, 1500);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${messagesInput.trim() ? "bg-[#0A84FF] text-white" : "bg-[#1C1C1E] text-white/30"}`}
                          >
                            <Send size={16} className="-ml-0.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : phoneApp === "camera" ? (
                  <div className="bg-black absolute inset-0 z-20 flex items-center justify-center">
                    <div className="text-center font-medium text-white/50 flex flex-col items-center gap-3">
                      <Camera size={48} className="text-white/20" />
                      No Camera Connected
                    </div>
                  </div>
                ) : phoneApp === "contacts" ? (
                  <div className="bg-black/90 text-white absolute inset-0 z-20 flex flex-col pt-14 backdrop-blur-md">
                    <div className="px-6 pb-4 border-b border-white/10">
                      <h2 className="text-3xl font-bold tracking-tight">
                        Contacts
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-8">
                      {[
                        { name: "Mom", desc: "Family", expertRole: "", fee: 0, color: "bg-pink-500/20 text-pink-400" },
                        { name: "Dad", desc: "Family", expertRole: "", fee: 0, color: "bg-blue-500/20 text-blue-400" },
                        { name: "Son", desc: "Family", expertRole: "", fee: 0, color: "bg-green-500/20 text-green-400" },
                        { name: "Mike", desc: "Friend", expertRole: "", fee: 0, color: "bg-yellow-500/20 text-yellow-500" },
                        { name: "Sarah", desc: "Friend", expertRole: "", fee: 0, color: "bg-purple-500/20 text-purple-400" },
                        { name: "David", desc: "Friend", expertRole: "", fee: 0, color: "bg-orange-500/20 text-orange-400" },
                        { name: "Dr. Harrison", desc: "Historian · $300/call", expertRole: "historian specializing in European and Asian antiquities", fee: 300, color: "bg-gray-500/20 text-gray-400" },
                        { name: "Prof. Miller", desc: "Appraiser · $500/call", expertRole: "antique appraiser with 30 years of experience in authentication", fee: 500, color: "bg-indigo-500/20 text-indigo-400" },
                        { name: "Mr. Vance", desc: "Museum Exec · $750/call", expertRole: "museum executive and art authentication specialist", fee: 750, color: "bg-emerald-500/20 text-emerald-400" },
                      ].map((contact, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            playClickSound();
                            if (contact.expertRole) {
                              callExpert(contact.name, contact.expertRole, contact.fee);
                              setPhoneApp(null);
                              setIsPhoneOpen(false);
                            }
                          }}
                          className="w-full px-6 py-3 border-b border-white/10 hover:bg-white/5 text-left flex items-center gap-4 transition-all duration-150 active:scale-[0.98] active:opacity-70 group"
                        >
                          <div
                            className={`w-10 h-10 rounded-full ${contact.color} flex items-center justify-center font-bold text-lg transition-transform group-active:scale-90`}
                          >
                            {contact.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-[15px]">
                              {contact.name}
                            </div>
                            <div className="text-xs text-white/50">
                              {contact.desc}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#34C759]/20 text-[#34C759] flex items-center justify-center transition-transform group-active:scale-90">
                            <PhoneCall size={14} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : phoneApp === "settings" ? (
                  <div className="bg-[#1C1C1E] text-white absolute inset-0 z-20 flex flex-col">
                    <div className="px-5 pt-14 pb-3 bg-[#1C1C1E]">
                      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden pb-8 space-y-6 px-4">
                      {/* Profile */}
                      <div className="bg-[#2C2C2E] rounded-2xl flex items-center gap-4 p-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9500] to-[#FF3B30] flex items-center justify-center text-2xl font-bold">P</div>
                        <div>
                          <div className="font-semibold text-lg">Pawn Master</div>
                          <div className="text-xs text-white/50">Apple ID, iCloud, Media & Purchases</div>
                        </div>
                        <div className="ml-auto text-white/30">›</div>
                      </div>
                      {/* Group 1 */}
                      <div className="bg-[#2C2C2E] rounded-2xl divide-y divide-white/10">
                        {[
                          { icon: "✈️", label: "Airplane Mode", toggle: false },
                          { icon: "📶", label: "Wi-Fi", value: "PawnShop_5G" },
                          { icon: "🔵", label: "Bluetooth", value: "On" },
                          { icon: "📡", label: "Cellular", value: "" },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg w-6 text-center">{row.icon}</span>
                            <span className="flex-1 text-[15px]">{row.label}</span>
                            {row.toggle !== undefined && row.toggle === false ? (
                              <div className="w-12 h-7 rounded-full bg-[#3A3A3C] relative"><div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow" /></div>
                            ) : (
                              <span className="text-white/40 text-sm">{row.value}</span>
                            )}
                            <span className="text-white/30 ml-1">›</span>
                          </div>
                        ))}
                      </div>
                      {/* Group 2 */}
                      <div className="bg-[#2C2C2E] rounded-2xl divide-y divide-white/10">
                        {[
                          { icon: "🔔", label: "Notifications" },
                          { icon: "🔊", label: "Sounds & Haptics" },
                          { icon: "🌙", label: "Focus" },
                          { icon: "⏱️", label: "Screen Time" },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg w-6 text-center">{row.icon}</span>
                            <span className="flex-1 text-[15px]">{row.label}</span>
                            <span className="text-white/30">›</span>
                          </div>
                        ))}
                      </div>
                      {/* Group 3 */}
                      <div className="bg-[#2C2C2E] rounded-2xl divide-y divide-white/10">
                        {[
                          { icon: "🌐", label: "General" },
                          { icon: "♿", label: "Accessibility" },
                          { icon: "🔒", label: "Privacy & Security" },
                          { icon: "🔋", label: "Battery", value: "84%" },
                          { icon: "🖥️", label: "Display & Brightness" },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg w-6 text-center">{row.icon}</span>
                            <span className="flex-1 text-[15px]">{row.label}</span>
                            {row.value && <span className="text-white/40 text-sm">{row.value}</span>}
                            <span className="text-white/30 ml-1">›</span>
                          </div>
                        ))}
                      </div>
                      {/* Group 4 */}
                      <div className="bg-[#2C2C2E] rounded-2xl divide-y divide-white/10">
                        {[
                          { icon: "📷", label: "Camera" },
                          { icon: "🗺️", label: "Maps" },
                          { icon: "🧭", label: "Compass" },
                          { icon: "🏥", label: "Health" },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <span className="text-lg w-6 text-center">{row.icon}</span>
                            <span className="flex-1 text-[15px]">{row.label}</span>
                            <span className="text-white/30">›</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/90 text-white absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md">
                    <div className="text-center font-medium text-white/50">
                      {phoneApp} App
                      <br />
                      Coming Soon...
                    </div>
                  </div>
                )}
              </div>

              {/* Home Indicator */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white shadow-sm rounded-full z-30 cursor-pointer active:scale-75 active:opacity-50 transition-all duration-150 hover:opacity-80"
                onClick={() => {
                  playClickSound();
                  if (phoneApp) setPhoneApp(null);
                  else setIsPhoneOpen(false);
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Item Box Modal */}
      {selectedItemBox && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto"
          onClick={() => setSelectedItemBox(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden flex flex-col rounded-2xl"
            style={{
              background: "linear-gradient(165deg, var(--game-surface) 0%, var(--game-bg-1) 100%)",
              border: "3px solid var(--game-border)",
              boxShadow: "0 0 40px rgba(213,162,77,0.2), 0 12px 40px rgba(0,0,0,0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full aspect-square flex items-center justify-center p-6"
              style={{ background: "var(--game-surface-raised)", borderBottom: "3px solid var(--game-border)" }}
            >
              <div
                className="absolute top-3 right-3 z-10 p-2 rounded-full cursor-pointer transition-all duration-150 hover:scale-110"
                style={{ background: "var(--game-surface)", color: "var(--game-text-dim)" }}
                onClick={() => setSelectedItemBox(null)}
              >
                <X size={20} />
              </div>
              <img
                src={
                  selectedItemImage ||
                  `https://placehold.co/600x600/3f2a1a/ffcc4d?text=${encodeURIComponent(selectedItemBox.itemName)}`
                }
                alt={selectedItemBox.itemName}
                className="w-full h-full object-contain rounded-xl"
                style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/600x600/3f2a1a/ffcc4d?text=${encodeURIComponent(selectedItemBox.itemName)}`;
                }}
              />
            </div>
            <div className="p-6">
              <div
                className="text-xs font-black uppercase tracking-[0.25em] mb-2"
                style={{ color: "var(--game-accent)", fontFamily: "'Arial Black', 'Impact', sans-serif" }}
              >
                Item Inspection
              </div>
              <h3
                className="text-2xl font-black uppercase tracking-wider mb-5 line-clamp-2"
                style={{ color: "var(--game-text)", fontFamily: "'Impact', 'Arial Black', sans-serif" }}
              >
                {selectedItemBox.itemName}
              </h3>
              <button
                onClick={() => setSelectedItemBox(null)}
                className="game-button w-full py-3 uppercase tracking-wider font-black"
                style={{ fontFamily: "'Arial Black', 'Impact', sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3], fov: 65, near: 0.1, far: 30 }}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      >
        {/* Bright sky blue background and fog for a fun, cheerful atmosphere */}
        <fog attach="fog" args={["#f0f9ff", 2, 22]} />
        <color attach="background" args={["#f0f9ff"]} />

        <Suspense fallback={null}>
          <CameraSetup />
          <PawnShop doorOpen={doorOpen} onRadioClick={() => { playClickSound(); setRadioOpen(true); }} />
          <Lighting />
          {activeNPCs.map((obj) => (
            <NPCCharacter
              key={obj.id}
              id={obj.id}
              npc={obj.npc}
              isLeaving={obj.isLeaving}
              targetPos={obj.position}
              currentLine={obj.currentLine}
              captionsEnabled={captionsEnabled}
            />
          ))}
          <ItemBoxes
            activeNPCs={activeNPCs}
            onOpenBox={async (id, itemName) => {
              const audio = new Audio("/click.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
              setSelectedItemBox({ id, itemName });
              setSelectedItemImage(null);
              try {
                const res = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(itemName)}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`,
                );
                const data = await res.json();
                if (data.query && data.query.pages) {
                  const pages = data.query.pages;
                  const pageId = Object.keys(pages)[0];
                  if (pages[pageId].original) {
                    setSelectedItemImage(pages[pageId].original.source);
                  }
                }
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
