/**
 * Pokemon TCG Data Import Script
 *
 * Downloads card data from PokemonTCG/pokemon-tcg-data repository,
 * processes it according to BinderDex schema, and uploads to Supabase.
 *
 * Usage: npx tsx scripts/import-cards.ts [--sets set1,set2] [--skip-colors]
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Legendary and Mythical Pokemon by National Dex numbers
const LEGENDARY_DEX = [
  144, 145, 146, 150, // Gen 1: Articuno, Zapdos, Moltres, Mewtwo
  243, 244, 245, 249, 250, // Gen 2: Raikou, Entei, Suicune, Lugia, Ho-Oh
  377, 378, 379, 380, 381, 382, 383, 384, // Gen 3
  480, 481, 482, 483, 484, 485, 486, 487, 488, // Gen 4
  638, 639, 640, 641, 642, 643, 644, 645, 646, // Gen 5
  716, 717, 718, // Gen 6
  785, 786, 787, 788, 789, 790, 791, 792, 800, // Gen 7
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898, // Gen 8
  1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024 // Gen 9
];

const MYTHICAL_DEX = [
  151, // Mew
  251, // Celebi
  385, 386, // Jirachi, Deoxys
  489, 490, 491, 492, 493, // Phione, Manaphy, Darkrai, Shaymin, Arceus
  494, 647, 648, 649, // Victini, Keldeo, Meloetta, Genesect
  719, 720, 721, // Diancie, Hoopa, Volcanion
  801, 802, 807, 808, 809, // Magearna, Marshadow, Zeraora, Meltan, Melmetal
  893, // Zarude
  1025 // Pecharunt
];

// Era detection based on set ID patterns and series
function detectEra(setId: string, series: string): string {
  // Mega Evolution 2025 sets
  if (setId.startsWith("mee") || setId.startsWith("mep") || setId.startsWith("mef")) {
    return "Mega Evolution";
  }
  // Scarlet & Violet
  if (setId.startsWith("sv") || series.includes("Scarlet & Violet")) {
    return "Scarlet & Violet";
  }
  // Sword & Shield
  if (setId.startsWith("swsh") || series.includes("Sword & Shield")) {
    return "Sword & Shield";
  }
  // Sun & Moon
  if (setId.startsWith("sm") || series.includes("Sun & Moon")) {
    return "Sun & Moon";
  }
  // XY
  if (setId.startsWith("xy") || series.includes("XY")) {
    return "XY";
  }
  // Black & White
  if (setId.startsWith("bw") || series.includes("Black & White")) {
    return "Black & White";
  }
  // HeartGold SoulSilver
  if (setId.startsWith("hgss") || series.includes("HeartGold")) {
    return "HeartGold SoulSilver";
  }
  // Platinum
  if (setId.startsWith("pl") || series.includes("Platinum")) {
    return "Platinum";
  }
  // Diamond & Pearl
  if (setId.startsWith("dp") || series.includes("Diamond & Pearl")) {
    return "Diamond & Pearl";
  }
  // EX era
  if (setId.startsWith("ex") || series.includes("EX")) {
    return "EX";
  }
  // e-Card
  if (series.includes("E-Card") || setId.startsWith("ecard")) {
    return "e-Card";
  }
  // Neo
  if (series.includes("Neo")) {
    return "Neo";
  }
  // Gym
  if (series.includes("Gym")) {
    return "Gym";
  }
  // Base Set era (Jungle, Fossil, etc.)
  if (series.includes("Base") || setId === "base1" || setId === "base2" ||
      series.includes("Jungle") || series.includes("Fossil") || series.includes("Rocket")) {
    return "Base Set";
  }

  return "Other";
}

// Determine which variants a card should have based on era and rarity
function getVariantsForCard(era: string, rarity: string | null, supertype: string): string[] {
  const variants: string[] = ["NORMAL"];

  // Trainers and Energy typically don't have reverse holos in most sets
  if (supertype !== "Pokémon") {
    return variants;
  }

  // Era-based variant rules
  switch (era) {
    case "Base Set":
      // First Edition and Shadowless only for Base Set
      variants.push("FIRST_EDITION");
      break;

    case "Gym":
    case "Neo":
      // First Edition for Gym and Neo
      variants.push("FIRST_EDITION");
      break;

    case "e-Card":
    case "EX":
    case "Diamond & Pearl":
    case "Platinum":
    case "HeartGold SoulSilver":
    case "Black & White":
    case "XY":
    case "Sun & Moon":
    case "Sword & Shield":
      // Reverse Holo for these eras
      variants.push("REVERSE_HOLO");
      break;

    case "Scarlet & Violet":
    case "Mega Evolution":
      // S&V only has reverse holos for Common/Uncommon/Rare, not Double Rare+
      const noReverseRarities = [
        "Double Rare", "Illustration Rare", "Special Illustration Rare",
        "Hyper Rare", "Ultra Rare", "Secret Rare", "ACE SPEC Rare"
      ];
      if (!rarity || !noReverseRarities.includes(rarity)) {
        variants.push("REVERSE_HOLO");
      }
      break;
  }

  return variants;
}

// Check if card is premium (Illustration Rare, Special Illustration Rare, etc.)
function isPremiumCard(rarity: string | null): boolean {
  if (!rarity) return false;
  const premiumRarities = [
    "Illustration Rare",
    "Special Illustration Rare",
    "Hyper Rare",
    "Secret Rare",
    "Ultra Rare",
    "Rare Ultra",
    "ACE SPEC Rare"
  ];
  return premiumRarities.includes(rarity);
}

// Determine generation from National Dex number
function getGeneration(dexNumbers: number[]): number | null {
  if (!dexNumbers || dexNumbers.length === 0) return null;

  const dex = Math.min(...dexNumbers);
  if (dex <= 151) return 1;
  if (dex <= 251) return 2;
  if (dex <= 386) return 3;
  if (dex <= 493) return 4;
  if (dex <= 649) return 5;
  if (dex <= 721) return 6;
  if (dex <= 809) return 7;
  if (dex <= 905) return 8;
  return 9;
}

interface RawSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate?: string;
  images?: {
    logo?: string;
    symbol?: string;
  };
}

interface RawCard {
  id: string;
  name: string;
  number: string;
  supertype: string;
  subtypes?: string[];
  types?: string[];
  hp?: string;
  rarity?: string;
  artist?: string;
  nationalPokedexNumbers?: number[];
  images?: {
    small?: string;
    large?: string;
  };
  set: {
    id: string;
  };
}

async function importSet(setData: RawSet) {
  const era = detectEra(setData.id, setData.series);

  const set = {
    id: setData.id,
    name: setData.name,
    series: setData.series,
    era,
    printed_total: setData.printedTotal,
    total: setData.total,
    release_date: setData.releaseDate || null,
    has_reverse_holos: !["Base Set", "Gym", "Neo"].includes(era),
    logo_url: setData.images?.logo || null,
    symbol_url: setData.images?.symbol || null,
  };

  const { error } = await supabase
    .from("sets")
    .upsert(set, { onConflict: "id" });

  if (error) {
    console.error(`Error inserting set ${set.id}:`, error.message);
    return null;
  }

  console.log(`Imported set: ${set.name} (${set.id}) - Era: ${era}`);
  return set;
}

async function importCard(cardData: RawCard, era: string) {
  const dexNumbers = cardData.nationalPokedexNumbers || [];
  const generation = getGeneration(dexNumbers);

  const card = {
    id: cardData.id,
    set_id: cardData.set.id,
    name: cardData.name,
    number: cardData.number,
    rarity: cardData.rarity || null,
    supertype: cardData.supertype,
    subtypes: cardData.subtypes || [],
    types: cardData.types || [],
    hp: cardData.hp ? parseInt(cardData.hp) : null,
    artist: cardData.artist || null,
    national_dex_numbers: dexNumbers,
    image_small: cardData.images?.small || null,
    image_large: cardData.images?.large || null,
    is_promo: cardData.number?.includes("PROMO") || cardData.set.id?.includes("promo") || false,
    is_premium: isPremiumCard(cardData.rarity),
    is_legendary: dexNumbers.some(n => LEGENDARY_DEX.includes(n)),
    is_mythical: dexNumbers.some(n => MYTHICAL_DEX.includes(n)),
    generation,
  };

  const { error: cardError } = await supabase
    .from("cards")
    .upsert(card, { onConflict: "id" });

  if (cardError) {
    console.error(`Error inserting card ${card.id}:`, cardError.message);
    return null;
  }

  // Create variants
  const variantTypes = getVariantsForCard(era, cardData.rarity, cardData.supertype);

  for (const variantType of variantTypes) {
    const { error: variantError } = await supabase
      .from("card_variants")
      .upsert({
        card_id: card.id,
        variant_type: variantType,
        image_url: null, // Use card's image unless variant-specific
      }, {
        onConflict: "card_id,variant_type",
        ignoreDuplicates: true
      });

    if (variantError && !variantError.message.includes("duplicate")) {
      console.error(`Error inserting variant for ${card.id}:`, variantError.message);
    }
  }

  return card;
}

async function downloadAndImport(setIds?: string[]) {
  console.log("Starting Pokemon TCG data import...");
  console.log("Fetching data from GitHub repository...\n");

  // Download sets data
  const setsUrl = "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/sets/en.json";
  const setsResponse = await fetch(setsUrl);
  const setsData: RawSet[] = await setsResponse.json();

  // Filter sets if specific ones requested
  const setsToImport = setIds
    ? setsData.filter(s => setIds.includes(s.id))
    : setsData;

  console.log(`Found ${setsToImport.length} sets to import\n`);

  // Import each set and its cards
  for (const setData of setsToImport) {
    const set = await importSet(setData);
    if (!set) continue;

    // Download cards for this set
    const cardsUrl = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${setData.id}.json`;

    try {
      const cardsResponse = await fetch(cardsUrl);
      if (!cardsResponse.ok) {
        console.warn(`  No cards found for set ${setData.id}`);
        continue;
      }

      const cardsData: RawCard[] = await cardsResponse.json();
      console.log(`  Importing ${cardsData.length} cards...`);

      let imported = 0;
      for (const cardData of cardsData) {
        const card = await importCard(cardData, set.era);
        if (card) imported++;
      }

      console.log(`  Imported ${imported}/${cardsData.length} cards\n`);
    } catch (error) {
      console.error(`  Error fetching cards for ${setData.id}:`, error);
    }
  }

  console.log("\nImport complete!");
}

// Parse command line arguments
const args = process.argv.slice(2);
let setIds: string[] | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sets" && args[i + 1]) {
    setIds = args[i + 1].split(",");
  }
}

// Run the import
downloadAndImport(setIds).catch(console.error);
