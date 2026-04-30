export type ItemCategory = "Weapons" | "Jewelry" | "Art" | "Antiques" | "Instruments" | "Manuscripts" | "Relics" | "Navigation" | "Armor" | "Ceramics" | "Timepieces" | "Coins" | "Textiles" | "Sculptures" | "Tools";
export type ItemRarity = "common" | "uncommon" | "rare" | "legendary";

export interface PawnItem {
  id: string;
  name: string;
  description: string;
  region: string;
  category: ItemCategory;
  baseValue: number;
  rarity: ItemRarity;
  image: string;
}

// Wikimedia Commons thumb helper
const wk = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/300px-${path.split("/").pop()}`;

export const PAWN_ITEMS: PawnItem[] = [
  // === WEAPONS (1-15) ===
  { id: "1", name: "Samurai Katana", description: "Edo-period folded steel blade with ray-skin grip.", region: "Japan", category: "Weapons", baseValue: 1200, rarity: "rare", image: wk("4/48/Antique_Japanese_%28samurai%29_katana_met_museum.jpg") },
  { id: "2", name: "Roman Gladius", description: "Short stabbing sword used by Roman legionaries.", region: "Rome", category: "Weapons", baseValue: 800, rarity: "uncommon", image: wk("3/3f/Uncrossed_gladridge.jpg") },
  { id: "3", name: "Viking Ulfberht Sword", description: "Crucible steel blade inscribed +VLFBERHT+.", region: "Scandinavia", category: "Weapons", baseValue: 1500, rarity: "rare", image: wk("b/b1/Ulfberht_sword_at_the_Germanic_National_Museum%2C_N%C3%BCrnberg.jpg") },
  { id: "4", name: "Ottoman Kilij", description: "Curved cavalry sabre with gold-inlaid hilt.", region: "Turkey", category: "Weapons", baseValue: 900, rarity: "uncommon", image: wk("5/55/Kilij_of_the_Ottoman_Empire.jpg") },
  { id: "5", name: "Chinese Jian Sword", description: "Double-edged straight sword from the Han Dynasty.", region: "China", category: "Weapons", baseValue: 700, rarity: "uncommon", image: wk("a/ae/Jian_%28sword%29.jpg") },
  { id: "6", name: "Persian Shamshir", description: "Deeply curved sabre favored by Persian cavalry.", region: "Persia", category: "Weapons", baseValue: 850, rarity: "uncommon", image: wk("4/4a/Shamshir.jpg") },
  { id: "7", name: "Scottish Claymore", description: "Two-handed Highland greatsword with quatrefoil guard.", region: "Scotland", category: "Weapons", baseValue: 1100, rarity: "rare", image: wk("e/e6/Claymore2.jpg") },
  { id: "8", name: "Indian Katar Dagger", description: "Push dagger with H-shaped horizontal grip.", region: "India", category: "Weapons", baseValue: 600, rarity: "common", image: wk("4/4b/Katar_%28dagger%29.jpg") },
  { id: "9", name: "Greek Xiphos", description: "Leaf-shaped bronze short sword from Classical Greece.", region: "Greece", category: "Weapons", baseValue: 950, rarity: "uncommon", image: wk("c/c8/Xiphos.jpg") },
  { id: "10", name: "Mughal Talwar", description: "Curved sword with disc pommel from Mughal India.", region: "India", category: "Weapons", baseValue: 750, rarity: "uncommon", image: wk("5/5a/Talwar_Sword.jpg") },
  { id: "11", name: "Maori Mere Club", description: "Short flat club carved from nephrite jade.", region: "New Zealand", category: "Weapons", baseValue: 500, rarity: "common", image: wk("3/3e/Mere_%28Weapon%29.jpg") },
  { id: "12", name: "Zulu Iklwa Spear", description: "Short stabbing spear introduced by Shaka Zulu.", region: "South Africa", category: "Weapons", baseValue: 400, rarity: "common", image: wk("8/8e/Zulu-weapons.jpg") },
  { id: "13", name: "Frankish Throwing Axe", description: "Francisca axe used by Merovingian warriors.", region: "Francia", category: "Weapons", baseValue: 550, rarity: "common", image: wk("a/a0/Francisca.jpg") },
  { id: "14", name: "Japanese Tanto", description: "Short blade carried as a sidearm by samurai.", region: "Japan", category: "Weapons", baseValue: 650, rarity: "common", image: wk("e/e0/Tanto_Kunimitsu.jpg") },
  { id: "15", name: "Gurkha Kukri", description: "Inward-curving Nepalese knife with notched spine.", region: "Nepal", category: "Weapons", baseValue: 350, rarity: "common", image: wk("d/d2/Kukri.jpg") },

  // === JEWELRY (16-30) ===
  { id: "16", name: "Celtic Gold Torc", description: "Twisted gold neck ring worn by Celtic chieftains.", region: "Britain", category: "Jewelry", baseValue: 1800, rarity: "rare", image: wk("4/4a/Snettisham_Great_Torc.jpg") },
  { id: "17", name: "Fabergé Egg", description: "Jeweled Easter egg crafted for Russian royalty.", region: "Russia", category: "Jewelry", baseValue: 5000, rarity: "legendary", image: wk("1/1e/Faberge_egg.jpg") },
  { id: "18", name: "Egyptian Scarab Amulet", description: "Carved lapis lazuli beetle symbolizing rebirth.", region: "Egypt", category: "Jewelry", baseValue: 600, rarity: "common", image: wk("5/5d/Egyptian_-_Scarab_-_Walters_4215_-_Bottom.jpg") },
  { id: "19", name: "Byzantine Gold Cross", description: "Pectoral cross with cloisonné enamel work.", region: "Byzantium", category: "Jewelry", baseValue: 1400, rarity: "rare", image: wk("e/e5/Byzantine_-_Pectoral_Cross_-_Walters_571707.jpg") },
  { id: "20", name: "Mughal Ruby Ring", description: "Gold ring set with an inscribed Burmese ruby.", region: "India", category: "Jewelry", baseValue: 2200, rarity: "rare", image: wk("5/5e/Mughal_ring.jpg") },
  { id: "21", name: "Viking Silver Arm Ring", description: "Twisted silver arm band used as currency.", region: "Scandinavia", category: "Jewelry", baseValue: 500, rarity: "common", image: wk("a/a2/Viking_arm_ring.jpg") },
  { id: "22", name: "Chinese Jade Bangle", description: "Nephrite jade bracelet from the Qing Dynasty.", region: "China", category: "Jewelry", baseValue: 900, rarity: "uncommon", image: wk("7/7e/Jade_bangle.jpg") },
  { id: "23", name: "Roman Gold Fibula", description: "Ornate cloak pin from the late Roman Empire.", region: "Rome", category: "Jewelry", baseValue: 700, rarity: "uncommon", image: wk("0/0e/Roman_Crossbow_Fibula.jpg") },
  { id: "24", name: "Persian Turquoise Necklace", description: "Strand of polished turquoise from Nishapur mines.", region: "Persia", category: "Jewelry", baseValue: 800, rarity: "uncommon", image: wk("a/a0/Nishapur_Turquoise_Necklace.jpg") },
  { id: "25", name: "Tibetan Dzi Bead", description: "Etched agate bead believed to ward off evil.", region: "Tibet", category: "Jewelry", baseValue: 450, rarity: "common", image: wk("c/c3/Dzi_bead.jpg") },
  { id: "26", name: "Hawaiian Lei Niho Palaoa", description: "Whale-tooth pendant on braided human hair.", region: "Hawaii", category: "Jewelry", baseValue: 1000, rarity: "uncommon", image: wk("e/e3/Lei_o_mano.jpg") },
  { id: "27", name: "Anglo-Saxon Garnet Brooch", description: "Gold and garnet cloisonné disc brooch.", region: "England", category: "Jewelry", baseValue: 1300, rarity: "rare", image: wk("d/d3/Staffordshire_Hoard_1.jpg") },
  { id: "28", name: "Minoan Gold Bee Pendant", description: "Two bees holding a honeycomb, from Crete.", region: "Crete", category: "Jewelry", baseValue: 1600, rarity: "rare", image: wk("5/5a/Bee_pendant.jpg") },
  { id: "29", name: "Thai Gold Crown Ornament", description: "Flame-shaped gold hair ornament from Ayutthaya.", region: "Thailand", category: "Jewelry", baseValue: 1100, rarity: "uncommon", image: wk("a/a2/Thai_gold_crown.jpg") },
  { id: "30", name: "Etruscan Gold Earrings", description: "Granulated gold earrings with filigree work.", region: "Italy", category: "Jewelry", baseValue: 1500, rarity: "rare", image: wk("e/e5/Etruscan_earring.jpg") },
];

// === ART & PAINTINGS (31-45) ===
PAWN_ITEMS.push(
  { id: "31", name: "Ming Dynasty Scroll Painting", description: "Ink-wash landscape on silk by a court painter.", region: "China", category: "Art", baseValue: 2000, rarity: "rare", image: wk("6/6b/Guo_Xi_-_Early_Spring_%28large%29.jpg") },
  { id: "32", name: "Byzantine Icon Panel", description: "Tempera on wood depicting the Virgin Mary.", region: "Byzantium", category: "Art", baseValue: 1800, rarity: "rare", image: wk("8/8e/Vladimirskaya.jpg") },
  { id: "33", name: "Japanese Ukiyo-e Print", description: "Woodblock print of The Great Wave off Kanagawa.", region: "Japan", category: "Art", baseValue: 1200, rarity: "uncommon", image: wk("a/a5/Tsunami_by_hokusai_19th_century.jpg") },
  { id: "34", name: "Persian Miniature Painting", description: "Illuminated manuscript page with gold leaf.", region: "Persia", category: "Art", baseValue: 1500, rarity: "rare", image: wk("0/09/Miraj_by_Sultan_Muhammad.jpg") },
  { id: "35", name: "Mughal Court Painting", description: "Watercolor portrait of a Mughal emperor.", region: "India", category: "Art", baseValue: 1400, rarity: "rare", image: wk("5/5a/Jahangir_investing_a_courtier_with_a_robe_of_honour_watched_by_Sir_Thomas_Roe%2C_English_ambassador_to_the_court_of_Jahangir_at_Agra_from_1615-18%2C_and_others.jpg") },
  { id: "36", name: "Tibetan Thangka", description: "Painted silk scroll of a Buddhist mandala.", region: "Tibet", category: "Art", baseValue: 900, rarity: "uncommon", image: wk("5/5a/Thangka_Mandala.jpg") },
  { id: "37", name: "Dutch Golden Age Portrait", description: "Oil portrait in the style of Rembrandt.", region: "Netherlands", category: "Art", baseValue: 2500, rarity: "rare", image: wk("b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg") },
  { id: "38", name: "Russian Orthodox Icon", description: "Gold-leaf icon of Saint George slaying the dragon.", region: "Russia", category: "Art", baseValue: 1100, rarity: "uncommon", image: wk("4/4e/Novgorod_George.jpg") },
  { id: "39", name: "Korean Joseon Painting", description: "Ink painting of mountains and pine trees.", region: "Korea", category: "Art", baseValue: 800, rarity: "uncommon", image: wk("e/e5/Jeong_Seon-Ingokjeongsa.jpg") },
  { id: "40", name: "Italian Renaissance Sketch", description: "Red chalk anatomical study on laid paper.", region: "Italy", category: "Art", baseValue: 3000, rarity: "legendary", image: wk("3/38/Leonardo_da_Vinci_-_Anatomical_studies_of_the_shoulder_-_WGA12824.jpg") },
  { id: "41", name: "Chinese Calligraphy Scroll", description: "Running-script calligraphy by a Song master.", region: "China", category: "Art", baseValue: 700, rarity: "common", image: wk("6/60/Mi_Fu-On_Calligraphy.jpg") },
  { id: "42", name: "Greek Black-Figure Amphora", description: "Attic vase depicting Heracles and the Hydra.", region: "Greece", category: "Art", baseValue: 1600, rarity: "rare", image: wk("5/5b/Herakles_Hydra_Louvre_CA598.jpg") },
  { id: "43", name: "Bayeux Tapestry Fragment", description: "Embroidered linen depicting the Norman conquest.", region: "France", category: "Art", baseValue: 4000, rarity: "legendary", image: wk("4/44/Bayeux_Tapestry_scene57_Harold_death.jpg") },
  { id: "44", name: "Aboriginal Bark Painting", description: "Ochre painting on eucalyptus bark.", region: "Australia", category: "Art", baseValue: 500, rarity: "common", image: wk("a/a0/Bark_Painting_Maningrida.jpg") },
  { id: "45", name: "Flemish Still Life", description: "Oil painting of flowers and fruit on panel.", region: "Flanders", category: "Art", baseValue: 1900, rarity: "rare", image: wk("1/18/Ambrosius_Bosschaert_the_Elder_%28Dutch_-_Flower_Still_Life_-_Google_Art_Project.jpg") },
);

// === ANTIQUES & RELICS (46-65) ===
PAWN_ITEMS.push(
  { id: "46", name: "Rosetta Stone Fragment", description: "Granodiorite slab with trilingual decree.", region: "Egypt", category: "Relics", baseValue: 5000, rarity: "legendary", image: wk("2/23/Rosetta_Stone.JPG") },
  { id: "47", name: "Mask of Tutankhamun Replica", description: "Gold funerary mask of the boy pharaoh.", region: "Egypt", category: "Relics", baseValue: 3500, rarity: "legendary", image: wk("4/4f/Tutanchamun_Maske.jpg") },
  { id: "48", name: "Terracotta Warrior Figure", description: "Life-size clay soldier from Qin Shi Huang's tomb.", region: "China", category: "Sculptures", baseValue: 2800, rarity: "rare", image: wk("4/49/Terracotta_Army%2C_View_of_Pit_1.jpg") },
  { id: "49", name: "Dead Sea Scroll Fragment", description: "Parchment with Hebrew text from Qumran caves.", region: "Israel", category: "Manuscripts", baseValue: 4500, rarity: "legendary", image: wk("2/2a/Dead_Sea_Scroll_-_part_of_Isaiah_Scroll_%28Isa_57.17_-_59.9%29.jpg") },
  { id: "50", name: "Antikythera Mechanism Piece", description: "Bronze gear from the ancient Greek computer.", region: "Greece", category: "Tools", baseValue: 4000, rarity: "legendary", image: wk("6/66/NAMA_Machine_d%27Anticyth%C3%A8re_1.jpg") },
  { id: "51", name: "Sutton Hoo Helmet", description: "Anglo-Saxon iron helmet with face mask.", region: "England", category: "Armor", baseValue: 3000, rarity: "legendary", image: wk("e/e2/Sutton_Hoo_helmet_2016.png") },
  { id: "52", name: "Nebra Sky Disk", description: "Bronze disk depicting the cosmos, 1600 BC.", region: "Germany", category: "Relics", baseValue: 3500, rarity: "legendary", image: wk("2/25/Nebra_Scheibe.jpg") },
  { id: "53", name: "Cyrus Cylinder", description: "Clay cylinder with the first declaration of rights.", region: "Persia", category: "Relics", baseValue: 4000, rarity: "legendary", image: wk("d/d6/Cyrus_Cylinder.jpg") },
  { id: "54", name: "Lewis Chessmen Figure", description: "Walrus ivory chess piece from medieval Norway.", region: "Scotland", category: "Antiques", baseValue: 1200, rarity: "uncommon", image: wk("3/3e/Lewis_Chessmen.jpg") },
  { id: "55", name: "Aztec Sun Stone Replica", description: "Carved basalt calendar stone of the Fifth Sun.", region: "Mexico", category: "Relics", baseValue: 2000, rarity: "rare", image: wk("4/44/Monolito_de_la_Piedra_del_Sol.jpg") },
  { id: "56", name: "Bust of Nefertiti", description: "Painted limestone bust of the Egyptian queen.", region: "Egypt", category: "Sculptures", baseValue: 3000, rarity: "legendary", image: wk("1/1f/Nofretete_Neues_Museum.jpg") },
  { id: "57", name: "Inca Quipu", description: "Knotted string recording device from the Andes.", region: "Peru", category: "Relics", baseValue: 800, rarity: "uncommon", image: wk("a/a7/Quipu.png") },
  { id: "58", name: "Ishtar Gate Brick", description: "Glazed blue brick with bull relief from Babylon.", region: "Mesopotamia", category: "Antiques", baseValue: 1500, rarity: "rare", image: wk("2/28/Ishtar_gate_in_Pergamon_museum_in_Berlin.jpg") },
  { id: "59", name: "Lycurgus Cup Fragment", description: "Roman dichroic glass that changes color in light.", region: "Rome", category: "Antiques", baseValue: 2500, rarity: "rare", image: wk("e/e5/Lycurgus_Cup.jpg") },
  { id: "60", name: "Phaistos Disc", description: "Mysterious stamped clay disk from Minoan Crete.", region: "Crete", category: "Relics", baseValue: 3000, rarity: "legendary", image: wk("8/84/Phaistos_Disc.jpg") },
  { id: "61", name: "Voynich Manuscript Page", description: "Undeciphered illustrated codex of unknown origin.", region: "Europe", category: "Manuscripts", baseValue: 2500, rarity: "rare", image: wk("9/93/Voynich_Manuscript_%28141%29.jpg") },
  { id: "62", name: "Crystal Skull", description: "Polished quartz skull of disputed Mesoamerican origin.", region: "Mesoamerica", category: "Relics", baseValue: 1800, rarity: "rare", image: wk("e/e0/Crystal_skull_british_museum.jpg") },
  { id: "63", name: "Olmec Colossal Head Replica", description: "Basalt portrait head of an Olmec ruler.", region: "Mexico", category: "Sculptures", baseValue: 1600, rarity: "rare", image: wk("9/9d/Cabeza_Colosal_n%C2%BA1_del_Museo_Xalapa.jpg") },
  { id: "64", name: "Staffordshire Hoard Piece", description: "Gold and garnet sword fitting from Anglo-Saxon England.", region: "England", category: "Relics", baseValue: 2200, rarity: "rare", image: wk("d/d3/Staffordshire_Hoard_1.jpg") },
  { id: "65", name: "Magna Carta Copy", description: "Vellum copy of the 1215 charter of liberties.", region: "England", category: "Manuscripts", baseValue: 4500, rarity: "legendary", image: wk("e/ee/Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg") },
);

// === CERAMICS & VASES (66-80) ===
PAWN_ITEMS.push(
  { id: "66", name: "Ming Dynasty Blue Vase", description: "Cobalt blue and white porcelain from Jingdezhen.", region: "China", category: "Ceramics", baseValue: 2200, rarity: "rare", image: wk("0/0a/Ming_Dynasty_blue-and-white_vase.jpg") },
  { id: "67", name: "Greek Red-Figure Krater", description: "Wine-mixing bowl depicting a symposium scene.", region: "Greece", category: "Ceramics", baseValue: 1400, rarity: "uncommon", image: wk("e/e1/Krater_Louvre_CA929.jpg") },
  { id: "68", name: "Japanese Raku Tea Bowl", description: "Hand-shaped black glaze bowl for tea ceremony.", region: "Japan", category: "Ceramics", baseValue: 800, rarity: "uncommon", image: wk("c/c0/Raku_tea_bowl.jpg") },
  { id: "69", name: "Iznik Tile Panel", description: "Ottoman ceramic tile with tulip and carnation motifs.", region: "Turkey", category: "Ceramics", baseValue: 1100, rarity: "uncommon", image: wk("a/a5/Iznik_tiles.jpg") },
  { id: "70", name: "Korean Celadon Vase", description: "Goryeo-era jade-green glazed stoneware.", region: "Korea", category: "Ceramics", baseValue: 1300, rarity: "uncommon", image: wk("0/0e/Korean_celadon_vase.jpg") },
  { id: "71", name: "Delft Blue Plate", description: "Tin-glazed earthenware from the Dutch Golden Age.", region: "Netherlands", category: "Ceramics", baseValue: 500, rarity: "common", image: wk("d/d5/Delftware_plate.jpg") },
  { id: "72", name: "Tang Dynasty Horse Figure", description: "Sancai-glazed ceramic tomb guardian horse.", region: "China", category: "Ceramics", baseValue: 1800, rarity: "rare", image: wk("a/a5/Tang_horse.jpg") },
  { id: "73", name: "Etruscan Bucchero Vessel", description: "Black burnished pottery from pre-Roman Italy.", region: "Italy", category: "Ceramics", baseValue: 700, rarity: "common", image: wk("e/e5/Etruscan_bucchero_ware.jpg") },
  { id: "74", name: "Moche Portrait Vessel", description: "Realistic ceramic face jug from ancient Peru.", region: "Peru", category: "Ceramics", baseValue: 900, rarity: "uncommon", image: wk("a/a2/Moche_portrait_ceramic_Quai_Branly_71.1930.19.162_n2.jpg") },
  { id: "75", name: "Meissen Porcelain Figurine", description: "Hand-painted European hard-paste porcelain.", region: "Germany", category: "Ceramics", baseValue: 1000, rarity: "uncommon", image: wk("e/e5/Meissen_figurine.jpg") },
  { id: "76", name: "Sèvres Porcelain Cup", description: "Royal French porcelain with gilt decoration.", region: "France", category: "Ceramics", baseValue: 1200, rarity: "uncommon", image: wk("a/a5/Sevres_Porcelain.jpg") },
  { id: "77", name: "Wedgwood Jasperware Vase", description: "Blue and white stoneware with classical reliefs.", region: "England", category: "Ceramics", baseValue: 600, rarity: "common", image: wk("5/5a/Wedgwood_-_Portland_Vase.jpg") },
  { id: "78", name: "Song Dynasty Ding Ware Bowl", description: "Ivory-white glazed porcelain with incised lotus.", region: "China", category: "Ceramics", baseValue: 1600, rarity: "rare", image: wk("a/a5/Song_Ding_ware.jpg") },
  { id: "79", name: "Hispano-Moresque Plate", description: "Lustre-glazed plate with Islamic geometric patterns.", region: "Spain", category: "Ceramics", baseValue: 850, rarity: "uncommon", image: wk("a/a5/Hispano-Moresque_Ware.jpg") },
  { id: "80", name: "Jomon Pottery Vessel", description: "Cord-marked clay pot, among the world's oldest ceramics.", region: "Japan", category: "Ceramics", baseValue: 1100, rarity: "uncommon", image: wk("5/5a/JomonPottery.jpg") },
);

// === NAVIGATION & INSTRUMENTS (81-95) ===
PAWN_ITEMS.push(
  { id: "81", name: "Astrolabe", description: "Brass instrument for celestial navigation from the Islamic Golden Age.", region: "Middle East", category: "Navigation", baseValue: 1500, rarity: "rare", image: wk("2/25/Astrolabe-Persian-18C.jpg") },
  { id: "82", name: "Song Dynasty Compass", description: "Magnetized needle floating in a water bowl.", region: "China", category: "Navigation", baseValue: 1200, rarity: "uncommon", image: wk("a/a5/Compass_in_a_wooden_box.jpg") },
  { id: "83", name: "Galileo-era Telescope", description: "Brass refracting telescope from 17th-century Italy.", region: "Italy", category: "Navigation", baseValue: 2000, rarity: "rare", image: wk("a/a0/Galileo%27s_telescopes.jpg") },
  { id: "84", name: "Sextant", description: "Brass navigation instrument from the Age of Sail.", region: "England", category: "Navigation", baseValue: 900, rarity: "uncommon", image: wk("3/3c/Sextant.jpg") },
  { id: "85", name: "Armillary Sphere", description: "Renaissance model of celestial rings and orbits.", region: "Europe", category: "Navigation", baseValue: 1800, rarity: "rare", image: wk("a/a5/Armillary_sphere.jpg") },
  { id: "86", name: "Han Dynasty Seismograph", description: "Bronze vessel that detected distant earthquakes.", region: "China", category: "Tools", baseValue: 2500, rarity: "rare", image: wk("a/a5/EastHanSeworkmograph.JPG") },
  { id: "87", name: "Pocket Watch (16th Century)", description: "Nuremberg egg — one of the earliest portable clocks.", region: "Germany", category: "Timepieces", baseValue: 1600, rarity: "rare", image: wk("a/a5/German_-_Spherical_Table_Watch_%28Melanchthon%27s_Watch%29_-_Walters_5817_-_View_C.jpg") },
  { id: "88", name: "WWI Trench Watch", description: "Wristwatch with shrapnel guard from the Western Front.", region: "Europe", category: "Timepieces", baseValue: 700, rarity: "uncommon", image: wk("a/a5/Trench_watch.jpg") },
  { id: "89", name: "Sundial (Roman)", description: "Portable bronze sundial with latitude markings.", region: "Rome", category: "Timepieces", baseValue: 600, rarity: "common", image: wk("a/a5/Sundial_on_the_Moot_Hall%2C_Aldeburgh.jpg") },
  { id: "90", name: "Hourglass (Medieval)", description: "Blown glass sand timer in a carved wood frame.", region: "Europe", category: "Timepieces", baseValue: 400, rarity: "common", image: wk("7/70/Wooden_hourglass_3.jpg") },
  { id: "91", name: "Stradivarius Violin", description: "Legendary Italian string instrument from Cremona.", region: "Italy", category: "Instruments", baseValue: 5000, rarity: "legendary", image: wk("1/1e/Stradivarius_violin_front.jpg") },
  { id: "92", name: "Chinese Guqin", description: "Seven-string zither, the instrument of scholars.", region: "China", category: "Instruments", baseValue: 1400, rarity: "uncommon", image: wk("a/a5/Guqin2.jpg") },
  { id: "93", name: "Indian Sitar", description: "Plucked string instrument with sympathetic strings.", region: "India", category: "Instruments", baseValue: 800, rarity: "common", image: wk("2/2c/Sitar_full.jpg") },
  { id: "94", name: "Japanese Shakuhachi", description: "Bamboo end-blown flute used by Zen monks.", region: "Japan", category: "Instruments", baseValue: 500, rarity: "common", image: wk("a/a5/Shakuhachi.jpg") },
  { id: "95", name: "Leeuwenhoek Microscope", description: "Tiny brass single-lens microscope from the 1670s.", region: "Netherlands", category: "Tools", baseValue: 2200, rarity: "rare", image: wk("a/a5/Leeuwenhoek_Microscope.png") },
);

// === ARMOR & TEXTILES (96-115) ===
PAWN_ITEMS.push(
  { id: "96", name: "Samurai Kabuto Helmet", description: "Lacquered iron helmet with crescent moon crest.", region: "Japan", category: "Armor", baseValue: 1800, rarity: "rare", image: wk("a/a5/Samurai_helmet.jpg") },
  { id: "97", name: "Knight's Gauntlet", description: "Articulated steel glove from a suit of plate armor.", region: "Europe", category: "Armor", baseValue: 900, rarity: "uncommon", image: wk("a/a5/Gauntlet_1.jpg") },
  { id: "98", name: "Roman Legionary Shield", description: "Curved rectangular scutum with eagle emblem.", region: "Rome", category: "Armor", baseValue: 1100, rarity: "uncommon", image: wk("a/a5/Scutum_reproduction.jpg") },
  { id: "99", name: "Viking Round Shield", description: "Linden wood shield with iron boss and rim.", region: "Scandinavia", category: "Armor", baseValue: 700, rarity: "common", image: wk("a/a5/Viking_shield.jpg") },
  { id: "100", name: "Mughal Chain Mail", description: "Riveted steel mail shirt with brass borders.", region: "India", category: "Armor", baseValue: 1300, rarity: "uncommon", image: wk("a/a5/Chainmail_shirt.jpg") },
  { id: "101", name: "Greek Corinthian Helmet", description: "Bronze helmet covering the full face with T-slit.", region: "Greece", category: "Armor", baseValue: 1500, rarity: "rare", image: wk("5/5d/Corinthian_helmet_Denda_Staatliche_Antikensammlungen.jpg") },
  { id: "102", name: "Ottoman Sipahi Helmet", description: "Steel helmet with nose guard and mail aventail.", region: "Turkey", category: "Armor", baseValue: 1000, rarity: "uncommon", image: wk("a/a5/Ottoman_helmet.jpg") },
  { id: "103", name: "Persian Silk Carpet", description: "Hand-knotted Isfahan carpet with medallion design.", region: "Persia", category: "Textiles", baseValue: 2500, rarity: "rare", image: wk("a/a5/Ardabil_Carpet.jpg") },
  { id: "104", name: "Chinese Dragon Robe", description: "Imperial silk robe embroidered with five-clawed dragons.", region: "China", category: "Textiles", baseValue: 2000, rarity: "rare", image: wk("a/a5/Chinese_dragon_robe.jpg") },
  { id: "105", name: "Indian Pashmina Shawl", description: "Fine cashmere shawl with paisley embroidery.", region: "India", category: "Textiles", baseValue: 800, rarity: "uncommon", image: wk("a/a5/Pashmina_shawl.jpg") },
  { id: "106", name: "Gobelin Tapestry Fragment", description: "Woven wool depicting a medieval hunting scene.", region: "France", category: "Textiles", baseValue: 1800, rarity: "rare", image: wk("a/a5/Lady_and_the_Unicorn.jpg") },
  { id: "107", name: "Navajo Blanket", description: "Hand-woven wool blanket with geometric patterns.", region: "North America", category: "Textiles", baseValue: 600, rarity: "common", image: wk("a/a5/Navajo_blanket.jpg") },
  { id: "108", name: "Japanese Kimono (Edo)", description: "Silk kimono with hand-painted cherry blossoms.", region: "Japan", category: "Textiles", baseValue: 1100, rarity: "uncommon", image: wk("a/a5/Kimono.jpg") },
  { id: "109", name: "Roman Denarius Coin", description: "Silver coin bearing the portrait of Emperor Augustus.", region: "Rome", category: "Coins", baseValue: 400, rarity: "common", image: wk("e/e9/Denarius-Domitian-Minerva-RIC_0002%2C0163.jpg") },
  { id: "110", name: "Greek Tetradrachm", description: "Silver coin with Athena's owl from Athens.", region: "Greece", category: "Coins", baseValue: 600, rarity: "common", image: wk("3/33/Tetradrachm_Athens_480-420BC_MBA_Lyon.jpg") },
  { id: "111", name: "Byzantine Solidus", description: "Gold coin of Emperor Justinian I.", region: "Byzantium", category: "Coins", baseValue: 900, rarity: "uncommon", image: wk("a/a5/Solidus_Justinian.jpg") },
  { id: "112", name: "Mughal Gold Mohur", description: "Gold coin with Persian calligraphy from Akbar's reign.", region: "India", category: "Coins", baseValue: 1200, rarity: "uncommon", image: wk("a/a5/Mughal_coin.jpg") },
  { id: "113", name: "Chinese Cash Coin", description: "Round bronze coin with square hole from the Tang Dynasty.", region: "China", category: "Coins", baseValue: 200, rarity: "common", image: wk("a/a5/Chinese_cash_coin.jpg") },
  { id: "114", name: "Spanish Doubloon", description: "Gold escudo coin from the treasure fleets.", region: "Spain", category: "Coins", baseValue: 1500, rarity: "rare", image: wk("a/a5/Spanish_gold_doubloon.jpg") },
  { id: "115", name: "Viking Silver Dirham", description: "Arabic silver coin found in a Scandinavian hoard.", region: "Scandinavia", category: "Coins", baseValue: 500, rarity: "common", image: wk("a/a5/Viking_dirham.jpg") },
);

// === MANUSCRIPTS, SCULPTURES & MISC (116-150) ===
PAWN_ITEMS.push(
  { id: "116", name: "Gutenberg Bible Page", description: "Printed vellum leaf from the first movable-type Bible.", region: "Germany", category: "Manuscripts", baseValue: 4000, rarity: "legendary", image: wk("b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg") },
  { id: "117", name: "Book of Kells Page", description: "Illuminated manuscript page with Celtic knotwork.", region: "Ireland", category: "Manuscripts", baseValue: 3500, rarity: "legendary", image: wk("b/b1/KellsFol032vChristEntworded.jpg") },
  { id: "118", name: "Maya Codex Fragment", description: "Bark-paper manuscript with hieroglyphic writing.", region: "Mesoamerica", category: "Manuscripts", baseValue: 2800, rarity: "rare", image: wk("a/a5/Dresden_Codex.jpg") },
  { id: "119", name: "Shroud of Turin Piece", description: "Linen cloth bearing a faint human image.", region: "Italy", category: "Relics", baseValue: 3000, rarity: "legendary", image: wk("9/9d/Shroudofturin.jpg") },
  { id: "120", name: "Holy Lance Replica", description: "Spearhead said to have pierced Christ's side.", region: "Jerusalem", category: "Relics", baseValue: 2500, rarity: "rare", image: wk("a/a5/Holy_Lance.jpg") },
  { id: "121", name: "Excalibur Replica Sword", description: "Legendary sword of King Arthur, ornate hilt.", region: "Britain", category: "Weapons", baseValue: 1800, rarity: "rare", image: wk("a/a5/Excalibur.jpg") },
  { id: "122", name: "Mjolnir Pendant", description: "Silver Thor's hammer amulet from a Viking grave.", region: "Scandinavia", category: "Jewelry", baseValue: 700, rarity: "common", image: wk("d/d4/Mjolnir.png") },
  { id: "123", name: "Senet Game Board", description: "Ancient Egyptian board game found in tombs.", region: "Egypt", category: "Antiques", baseValue: 800, rarity: "uncommon", image: wk("a/a5/Senet_game.jpg") },
  { id: "124", name: "Royal Game of Ur Board", description: "Sumerian racing game inlaid with shell and lapis.", region: "Mesopotamia", category: "Antiques", baseValue: 1500, rarity: "rare", image: wk("c/c4/British_Museum_Royal_Game_of_Ur.jpg") },
  { id: "125", name: "Winged Victory of Samothrace", description: "Marble sculpture of Nike, goddess of victory.", region: "Greece", category: "Sculptures", baseValue: 3500, rarity: "legendary", image: wk("5/5f/Victoire_de_Samothrace_-_vue_de_trois-quart_gauche%2C_gros_plan_de_la_statue_%282%29.JPG") },
  { id: "126", name: "Venus de Milo Miniature", description: "Marble statuette of Aphrodite, armless.", region: "Greece", category: "Sculptures", baseValue: 1200, rarity: "uncommon", image: wk("c/c2/Venus_de_Milo_Louvre_Ma399_n4.jpg") },
  { id: "127", name: "Moai Head Replica", description: "Volcanic tuff carving from Easter Island.", region: "Easter Island", category: "Sculptures", baseValue: 1000, rarity: "uncommon", image: wk("a/a2/Moai_Rano_raraku.jpg") },
  { id: "128", name: "Benin Bronze Head", description: "Cast brass memorial head from the Kingdom of Benin.", region: "Nigeria", category: "Sculptures", baseValue: 2000, rarity: "rare", image: wk("a/a5/Benin_bronze.jpg") },
  { id: "129", name: "Gandhara Buddha Head", description: "Greco-Buddhist stone sculpture from ancient Pakistan.", region: "Pakistan", category: "Sculptures", baseValue: 1600, rarity: "rare", image: wk("a/a5/Gandhara_Buddha.jpg") },
  { id: "130", name: "Khmer Stone Apsara", description: "Sandstone celestial dancer from Angkor Wat.", region: "Cambodia", category: "Sculptures", baseValue: 1400, rarity: "uncommon", image: wk("a/a5/Apsara_Angkor_Wat.jpg") },
  { id: "131", name: "Code of Hammurabi Stele", description: "Basalt pillar inscribed with Babylonian law.", region: "Mesopotamia", category: "Relics", baseValue: 4000, rarity: "legendary", image: wk("6/64/Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg") },
  { id: "132", name: "Ark of the Covenant Model", description: "Gold-plated acacia wood chest with cherubim.", region: "Israel", category: "Relics", baseValue: 2000, rarity: "rare", image: wk("a/a5/Ark_of_the_Covenant.jpg") },
  { id: "133", name: "Spear of Destiny", description: "Iron lance tip associated with Roman centurion Longinus.", region: "Rome", category: "Relics", baseValue: 3000, rarity: "legendary", image: wk("a/a5/Holy_Lance.jpg") },
  { id: "134", name: "Xiangqi Set (Ming Dynasty)", description: "Carved ivory Chinese chess pieces in lacquer box.", region: "China", category: "Antiques", baseValue: 900, rarity: "uncommon", image: wk("a/a5/Xiangqi.jpg") },
  { id: "135", name: "Go Board (Edo Period)", description: "Kaya wood board with slate and shell stones.", region: "Japan", category: "Antiques", baseValue: 1100, rarity: "uncommon", image: wk("a/a5/Go_board.jpg") },
  { id: "136", name: "Mancala Board (Mali Empire)", description: "Carved hardwood board with cowrie shell pieces.", region: "Africa", category: "Antiques", baseValue: 400, rarity: "common", image: wk("a/a5/Mancala_board.jpg") },
  { id: "137", name: "Pachisi Board (Mughal)", description: "Cloth game board with ivory and ebony pawns.", region: "India", category: "Antiques", baseValue: 600, rarity: "common", image: wk("a/a5/Pachisi.jpg") },
  { id: "138", name: "Hnefatafl Board", description: "Viking strategy board game with bone pieces.", region: "Scandinavia", category: "Antiques", baseValue: 500, rarity: "common", image: wk("a/a5/Hnefatafl.jpg") },
  { id: "139", name: "Polo Mallet (Persian)", description: "Carved willow mallet from the sport of kings.", region: "Persia", category: "Antiques", baseValue: 350, rarity: "common", image: wk("a/a5/Polo_mallet.jpg") },
  { id: "140", name: "Iron Crown of Lombardy", description: "Gold crown with a band said to contain a Holy Nail.", region: "Italy", category: "Jewelry", baseValue: 3500, rarity: "legendary", image: wk("a/a5/Iron_Crown.jpg") },
  { id: "141", name: "Charlemagne's Crown Replica", description: "Octagonal gold crown with gemstones and enamel.", region: "Francia", category: "Jewelry", baseValue: 2800, rarity: "rare", image: wk("a/a5/Imperial_Crown_of_the_Holy_Roman_Empire.jpg") },
  { id: "142", name: "Inuit Bone Carving", description: "Walrus ivory carving of a polar bear.", region: "Arctic", category: "Sculptures", baseValue: 450, rarity: "common", image: wk("a/a5/Inuit_carving.jpg") },
  { id: "143", name: "Native American Dreamcatcher", description: "Willow hoop with sinew web and feathers.", region: "North America", category: "Antiques", baseValue: 300, rarity: "common", image: wk("a/a5/Dreamcatcher.jpg") },
  { id: "144", name: "Toltec Warrior Statue", description: "Basalt Atlantean figure from Tula.", region: "Mexico", category: "Sculptures", baseValue: 1400, rarity: "uncommon", image: wk("a/a5/Toltec_warrior.jpg") },
  { id: "145", name: "Zapotec Funerary Urn", description: "Clay urn depicting a Zapotec deity.", region: "Mexico", category: "Ceramics", baseValue: 900, rarity: "uncommon", image: wk("a/a5/Zapotec_urn.jpg") },
  { id: "146", name: "Chimu Silver Cup", description: "Hammered silver ceremonial drinking vessel.", region: "Peru", category: "Antiques", baseValue: 700, rarity: "common", image: wk("a/a5/Chimu_silver.jpg") },
  { id: "147", name: "San Agustín Sculpture", description: "Volcanic stone guardian figure from Colombia.", region: "Colombia", category: "Sculptures", baseValue: 1000, rarity: "uncommon", image: wk("a/a5/San_Agustin_sculpture.jpg") },
  { id: "148", name: "Valdivia Figurine", description: "Stone Venus figurine from coastal Ecuador.", region: "Ecuador", category: "Sculptures", baseValue: 600, rarity: "common", image: wk("a/a5/Valdivia_figurine.jpg") },
  { id: "149", name: "Tiwanaku Monolith Piece", description: "Carved andesite fragment from the Gate of the Sun.", region: "Bolivia", category: "Sculptures", baseValue: 1200, rarity: "uncommon", image: wk("a/a5/Tiwanaku_monolith.jpg") },
  { id: "150", name: "Aboriginal Boomerang", description: "Hardwood returning boomerang with ochre designs.", region: "Australia", category: "Antiques", baseValue: 350, rarity: "common", image: wk("a/a5/Boomerang.jpg") },
);

// === IMAGE CACHE (persist in memory so same item always shows same image) ===
const imageCache = new Map<string, string>();

export function getCachedImage(item: PawnItem): string {
  if (imageCache.has(item.id)) return imageCache.get(item.id)!;
  imageCache.set(item.id, item.image);
  return item.image;
}

// === AUTHENTICITY SYSTEM ===
export interface SpawnedItem extends PawnItem {
  isAuthentic: boolean;
  isStolen: boolean;
}

export function spawnItem(): SpawnedItem {
  const item = getRandomPawnItem();
  const roll = Math.random();
  // 60% authentic, 30% fake, 10% stolen
  return {
    ...item,
    isAuthentic: roll < 0.6,
    isStolen: roll >= 0.9,
  };
}

// === RANDOM ITEM PICKER ===
let usedItems = new Set<string>();

export function getRandomPawnItem(): PawnItem {
  let available = PAWN_ITEMS.filter(item => !usedItems.has(item.id));
  if (available.length === 0) {
    usedItems.clear();
    available = PAWN_ITEMS;
  }
  const pick = available[Math.floor(Math.random() * available.length)];
  usedItems.add(pick.id);
  return pick;
}

// === STARTING INVENTORY (5 random authentic items) ===
export function getStartingInventory(): SpawnedItem[] {
  const items: SpawnedItem[] = [];
  for (let i = 0; i < 5; i++) {
    const item = getRandomPawnItem();
    items.push({ ...item, isAuthentic: true, isStolen: false });
  }
  return items;
}
