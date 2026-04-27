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
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import {
  getRandomCustomer,
  getRandomNPCByType,
  NPCPersonality,
  NPCType,
} from "./lib/npcPrompts";
import { getRandomPawnItem } from "./lib/items";
import { CameraSetup } from "./components/scene/CameraSetup";
import { NPCCharacter } from "./components/scene/NPCCharacter";
import { Lighting } from "./components/scene/Lighting";
import { PawnShop } from "./components/scene/PawnShop";
import { ItemBoxes } from "./components/scene/ItemBoxes";
import { OnboardingHero } from "./components/onboarding/OnboardingHero";
import OnboardingSetup, {
  type OnboardingSetupData,
} from "./components/onboarding/OnboardingSetup";

export default function App() {
  const [money, setMoney] = useState(1500);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const validSteps = ["hero", "setup", "game"] as const;
  type Step = (typeof validSteps)[number];
  const hashToStep = (): Step => {
    const h = window.location.hash.replace(/^#\/?/, "");
    return (validSteps as readonly string[]).includes(h) ? (h as Step) : "hero";
  };

  const [onboardingStep, setOnboardingStep] = useState<Step>(hashToStep);

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
      shopName: "Golden Pawn",
      difficulty: "dealer",
      startingCash: 1500,
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
      chatSession: any; // the gemini session
      position: [number, number, number]; // target standing pos
      item: string;
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
      price: 12000,
      seller: "@watchguy",
      condition: "Like New",
    },
    {
      id: 2,
      name: "Charizard 1st Ed",
      price: 5500,
      seller: "@cardking",
      condition: "PSA 9",
    },
    {
      id: 3,
      name: "Signed Baseball",
      price: 800,
      seller: "@sportsfan",
      condition: "Authenticated",
    },
    {
      id: 4,
      name: "Old Coin Collection",
      price: 1500,
      seller: "@numismatic",
      condition: "Various",
    },
  ]);
  const [myMarketItems] = useState([
    { id: 101, name: "Gold Ring", price: 300, status: "listed" },
    { id: 102, name: "Antique Vase", price: 750, status: "sold" },
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
            // to access spawnNPC safely here, we don't have it... wait we need to define it first, or use a button ref.
            // Actually it's easier to put the useEffect after spawnNPC is defined or rely on state.
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
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      if (process.env.GEMINI_API_KEY) {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } else {
        console.warn("GEMINI_API_KEY is not set.");
      }
    } catch (e) {
      console.error(e);
    }

    // Init Speech Recognition
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText(text);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const playClickSound = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      const maleVoice =
        voices.find(
          (v) =>
            (v.name.includes("Daniel") ||
              v.name.includes("Alex") ||
              v.name.includes("David") ||
              v.name.includes("Mark") ||
              v.name.includes("Guy")) &&
            v.lang.startsWith("en"),
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices[0];

      if (maleVoice) {
        utterance.voice = maleVoice;
      }

      // Force male pitch
      utterance.pitch = 0.8;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

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

    const itemInfo = getRandomPawnItem();
    const baseValue = Math.floor(Math.random() * 900) + 100;
    const minPrice = Math.floor(baseValue * 0.7);
    const maxBudget = Math.floor(baseValue * 1.3);
    const rentAmount = Math.floor(Math.random() * 1500) + 1000;

    let storyPrompt = "";
    if (npcDefinition.type === "SELLER") {
      storyPrompt = ` You possess a rare/historical item: ${itemInfo.name} from ${itemInfo.region}. Make up a creative, fun story about how you acquired it, why you want to sell it, and state your asking price (which should be around $${minPrice}).`;
    } else if (
      npcDefinition.type === "BUYER" ||
      npcDefinition.type === "COLLECTOR"
    ) {
      storyPrompt = ` You are looking to buy a rare/historical item: ${itemInfo.name} from ${itemInfo.region}. Make up a creative reason why you desperately need it, and state your starting offer (which should be around $${maxBudget}).`;
    }

    // Clone with specific specifics
    const npc: NPCPersonality = {
      ...npcDefinition,
      systemPrompt:
        npcDefinition.systemPrompt
          .replace(/\[ITEM_NAME\]/g, itemInfo.name)
          .replace(/\[MIN_PRICE\]/g, `$${minPrice}`)
          .replace(/\[MAX_PRICE\]/g, `$${maxBudget}`)
          .replace(/\[RENT_AMOUNT\]/g, `$${rentAmount}`) + storyPrompt,
    };

    const instanceId = Math.random().toString(36).substring(7);

    let session = null;
    if (aiRef.current) {
      session = aiRef.current.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: npc.systemPrompt,
        },
      });
    }

    const newNPC = {
      id: instanceId,
      npc: npc,
      isLeaving: false,
      chatHistory: [],
      currentLine: "...",
      chatSession: session,
      position: pos,
      item: itemInfo.name,
      hasItemBox:
        npc.type === "SELLER" ||
        npc.type === "BUYER" ||
        npc.type === "EXPERT" ||
        npc.type === "COLLECTOR",
    };

    setActiveNPCs((prev) => [...prev, newNPC]);

    // Initial greeting after walk
    setTimeout(() => {
      triggerNPCResponse(instanceId, "Hello?", newNPC);
    }, 2000);
  };

  const triggerNPCResponse = async (
    id: string,
    prompt: string,
    fallbackNpc: any,
  ) => {
    const npcObj = activeNPCs.find((n) => n.id === id) || fallbackNpc;
    if (!npcObj || !npcObj.chatSession) return;

    setIsTyping(true);
    try {
      const response = await npcObj.chatSession.sendMessage({
        message: prompt,
      });
      let text = response.text || "";

      let dealAmount = 0;
      const dealMatch = text.match(/\[ACTION:\s*DEAL\s*\$([\d.]+)\]/i);
      let isDealAction = false;
      if (dealMatch) {
        isDealAction = true;
        dealAmount = parseFloat(dealMatch[1]);
        text = text.replace(/\[ACTION:\s*DEAL\s*\$[\d.]+\]/gi, "").trim();

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
        speakText(text);
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

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const dismissNPC = (id: string) => {
    setActiveNPCs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isLeaving: true } : n)),
    );
    setTimeout(() => {
      setActiveNPCs((prev) => prev.filter((n) => n.id !== id));
      if (selectedNpcId === id) setSelectedNpcId(null);
    }, 4000);
  };

  if (onboardingStep === "hero") {
    return (
      <OnboardingHero
        onStart={() => {
          setOnboardingStep("game");
          setMoney(onboardingConfig.startingCash);
          setCaptionsEnabled(onboardingConfig.captionsEnabled);
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

        <button
          onClick={() => {
            playClickSound();
            setIsSettingsOpen(true);
          }}
          className="game-icon-button pointer-events-auto rounded-full p-3 shadow-lg transition-all duration-150"
          aria-label="Settings"
        >
          <SettingsIcon size={28} />
        </button>
      </div>

      {isSettingsOpen && (
        <div className="game-overlay pointer-events-auto absolute inset-0 z-20 flex items-center justify-center px-6 py-8">
          <div className="game-menu-shell game-scanlines flex h-full max-h-[620px] w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <aside className="game-menu-sidebar hidden w-64 shrink-0 p-6 md:block">
              <div className="mb-10">
                <div className="game-label">Pawn Shop</div>
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

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
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
              </div>

              <footer className="game-menu-footer flex items-center justify-between border-t px-6 py-5">
                <div className="game-text-dim text-xs font-bold uppercase tracking-[0.2em]">
                  Press Esc to return
                </div>
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
                <span>Wait for Customer</span>
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

      {/* NPC Subtitles & Interaction */}
      <div className="absolute bottom-8 left-0 w-full px-8 pointer-events-none flex flex-col items-center gap-4 z-10">
        {activeNPCs.map((n) => (
          <div
            key={n.id}
            className="w-full max-w-2xl flex flex-col gap-2 pointer-events-auto items-center"
          >
            {!n.isLeaving && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedNpcId(n.id);
                    setShowInput(true);
                  }}
                  className="game-button-primary px-4 py-2 text-sm transition-all duration-150 hover:scale-105 active:scale-90 active:opacity-75"
                >
                  Type Reply
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedNpcId(n.id);
                    startListening();
                  }}
                  className={`${isListening && selectedNpcId === n.id ? "bg-red-600 hover:bg-red-700 text-white border-red-300" : "game-button text-[#fff2cf]"} px-4 py-2 text-sm rounded-lg transition-all duration-150 hover:scale-105 active:scale-90 active:opacity-75 flex items-center gap-2`}
                >
                  {isListening && selectedNpcId === n.id
                    ? "Listening..."
                    : "Use Mic"}
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    dismissNPC(n.id);
                  }}
                  className="game-button px-4 py-2 text-sm text-[#fff2cf] transition-all duration-150 hover:scale-105 active:scale-90 active:opacity-75"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interaction Input overlay */}
      {showInput && selectedNpcId && (
        <div className="game-overlay absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-auto">
          <div className="game-menu-shell p-6 w-full max-w-lg flex flex-col gap-4 shadow-2xl">
            <h3 className="game-title text-lg">Your Reply:</h3>
            <textarea
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="game-input w-full p-3 resize-none h-24"
              placeholder="Type your response here..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setShowInput(false);
                  setInputText("");
                }}
                className="game-button px-4 py-2 text-sm transition-all duration-150 active:scale-90 active:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  handlePlayerSpeaks(selectedNpcId);
                }}
                className="game-button-primary px-6 py-2 text-sm transition-all duration-150 active:scale-90 active:opacity-75"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Button & Other Controls */}
      <div className="absolute bottom-8 right-8 z-40 pointer-events-auto flex flex-col items-end gap-3">
        <div className="flex gap-3 items-center">
          {!isPhoneOpen && activeNPCs.length < 2 && (
            <button
              id="btn-wait-customer"
              onClick={() => {
                playClickSound();
                spawnNPC();
              }}
              className="game-icon-button p-4 rounded-3xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 active:opacity-80 flex items-center justify-center group relative text-[#ffd877]"
            >
              <Clock size={32} />
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all game-value-chip text-xs px-2 py-1 rounded whitespace-nowrap">
                Wait for Customer
              </span>
            </button>
          )}
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
        </div>
      </div>

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

              {/* Content */}
              <div className="flex-1 relative z-10 overflow-hidden flex flex-col">
                {!phoneApp ? (
                  <div className="flex-1 flex flex-col justify-between pt-6 pb-6 px-4">
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
                          name: "Eleven Labs",
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
                    <div className="bg-white/30 backdrop-blur-2xl rounded-[32px] p-4 flex justify-between shadow-lg mx-auto w-full max-w-[92%] border border-white/20 mb-2 gap-2">
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
                          className={`w-[50px] h-[50px] ${app.color} rounded-[14px] flex items-center justify-center text-white shadow-sm active:scale-75 active:opacity-60 transition-all duration-150`}
                        >
                          <app.icon size={26} strokeWidth={1.5} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : phoneApp === "bank" ? (
                  <div className="bg-black text-white absolute inset-0 z-20 flex flex-col pt-6">
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
                    <div className="flex-1 overflow-y-auto bg-black px-6 pt-6 pb-12">
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
                  <div className="bg-[#1C1C1E] text-white absolute inset-0 z-20 flex flex-col pt-6">
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

                    <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2 gap-3 flex flex-col">
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
                  <div className="bg-black text-white absolute inset-0 z-20 flex flex-col pt-6">
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
                        <div className="flex-1 overflow-y-auto">
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
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  <div className="bg-black/90 text-white absolute inset-0 z-20 flex flex-col pt-6 backdrop-blur-md">
                    <div className="px-6 pb-4 border-b border-white/10">
                      <h2 className="text-3xl font-bold tracking-tight">
                        Contacts
                      </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto pb-8">
                      {[
                        {
                          name: "Mom",
                          desc: "Family",
                          type: undefined,
                          color: "bg-pink-500/20 text-pink-400",
                        },
                        {
                          name: "Dad",
                          desc: "Family",
                          type: undefined,
                          color: "bg-blue-500/20 text-blue-400",
                        },
                        {
                          name: "Son",
                          desc: "Family",
                          type: undefined,
                          color: "bg-green-500/20 text-green-400",
                        },
                        {
                          name: "Mike",
                          desc: "Friend",
                          type: undefined,
                          color: "bg-yellow-500/20 text-yellow-500",
                        },
                        {
                          name: "Sarah",
                          desc: "Friend",
                          type: undefined,
                          color: "bg-purple-500/20 text-purple-400",
                        },
                        {
                          name: "David",
                          desc: "Friend",
                          type: undefined,
                          color: "bg-orange-500/20 text-orange-400",
                        },
                        {
                          name: "Dr. Harrison",
                          desc: "Historian Expert",
                          type: "EXPERT",
                          color: "bg-gray-500/20 text-gray-400",
                        },
                        {
                          name: "Prof. Miller",
                          desc: "Antique Appraiser",
                          type: "EXPERT",
                          color: "bg-indigo-500/20 text-indigo-400",
                        },
                        {
                          name: "Mr. Vance",
                          desc: "Rich Collector",
                          type: "COLLECTOR",
                          color: "bg-emerald-500/20 text-emerald-400",
                        },
                        {
                          name: "Lady Smith",
                          desc: "Art Collector",
                          type: "COLLECTOR",
                          color: "bg-rose-500/20 text-rose-400",
                        },
                        {
                          name: "Local Museum",
                          desc: "Historical Society",
                          type: "EXPERT",
                          color: "bg-teal-500/20 text-teal-400",
                        },
                      ].map((contact, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            playClickSound();
                            setIsPhoneOpen(false);
                            setPhoneApp(null);
                            spawnNPC(contact.type as NPCType | undefined);
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
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setSelectedItemBox(null)}
        >
          <div
            className="bg-[#1C1C1E] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square bg-[#2C2C2E] flex items-center justify-center p-4 border-b border-white/10">
              <div
                className="absolute top-4 right-4 z-10 text-white/50 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
                onClick={() => setSelectedItemBox(null)}
              >
                <X size={20} />
              </div>
              <img
                src={
                  selectedItemImage ||
                  `https://placehold.co/600x600/1C1C1E/FFCC00?text=${encodeURIComponent(selectedItemBox.itemName)}`
                }
                alt={selectedItemBox.itemName}
                className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
                onError={(e) => {
                  // Fallback to placeholder if wikipedia image fails to load
                  e.currentTarget.src = `https://placehold.co/600x600/1C1C1E/FFCC00?text=${encodeURIComponent(selectedItemBox.itemName)}`;
                }}
              />
            </div>
            <div className="p-6">
              <div className="text-sm font-bold text-[#FFCC00] uppercase tracking-wider mb-2">
                Item Inspection
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2">
                {selectedItemBox.itemName}
              </h3>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSelectedItemBox(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.6, 3], fov: 65, near: 0.1, far: 30 }}
      >
        {/* Bright sky blue background and fog for a fun, cheerful atmosphere */}
        <fog attach="fog" args={["#f0f9ff", 2, 22]} />
        <color attach="background" args={["#f0f9ff"]} />

        <Suspense fallback={null}>
          <CameraSetup />
          <PawnShop />
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
