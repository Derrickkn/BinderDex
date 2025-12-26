/**
 * Color Extraction Script for ChromaDex
 *
 * Extracts dominant colors from card images using node-vibrant
 * and stores them in the card_colors table.
 *
 * Usage: npx tsx scripts/extract-colors.ts [--set set_id] [--limit 100]
 */

import { createClient } from "@supabase/supabase-js";
import Vibrant from "node-vibrant";
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

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface PaletteColor {
  hex: string;
  population: number;
  hsl: HSL;
}

// Convert hex to HSL
function hexToHsl(hex: string): HSL {
  // Remove #
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Calculate warmth from HSL (-1 = cool, 1 = warm)
function calculateWarmth(hsl: HSL): number {
  // Warm colors: 0-60 (red-yellow) and 300-360 (magenta-red)
  // Cool colors: 120-240 (green-blue)
  // Neutral: 60-120 (yellow-green) and 240-300 (blue-magenta)

  const h = hsl.h;

  if (h <= 60) {
    // Red to Yellow (warm)
    return 1 - (h / 60) * 0.5; // 1.0 to 0.5
  } else if (h <= 120) {
    // Yellow to Green (neutral to cool)
    return 0.5 - ((h - 60) / 60) * 1.0; // 0.5 to -0.5
  } else if (h <= 180) {
    // Green to Cyan (cool)
    return -0.5 - ((h - 120) / 60) * 0.5; // -0.5 to -1.0
  } else if (h <= 240) {
    // Cyan to Blue (cool)
    return -1.0 + ((h - 180) / 60) * 0.5; // -1.0 to -0.5
  } else if (h <= 300) {
    // Blue to Magenta (cool to neutral)
    return -0.5 + ((h - 240) / 60) * 1.0; // -0.5 to 0.5
  } else {
    // Magenta to Red (neutral to warm)
    return 0.5 + ((h - 300) / 60) * 0.5; // 0.5 to 1.0
  }
}

async function extractColorsFromImage(imageUrl: string): Promise<{
  dominantHex: string;
  dominantHsl: HSL;
  palette: PaletteColor[];
  brightness: number;
  saturation: number;
  warmth: number;
} | null> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    if (!palette) return null;

    // Get all swatches
    const swatches: PaletteColor[] = [];

    for (const [, swatch] of Object.entries(palette)) {
      if (swatch) {
        const hex = swatch.hex;
        const hsl = hexToHsl(hex);
        swatches.push({
          hex,
          population: swatch.population,
          hsl,
        });
      }
    }

    if (swatches.length === 0) return null;

    // Sort by population to get dominant color
    swatches.sort((a, b) => b.population - a.population);

    const dominant = swatches[0];
    const dominantHsl = dominant.hsl;

    // Calculate brightness (0-1) from luminance
    const brightness = dominantHsl.l / 100;

    // Calculate saturation (0-1)
    const saturation = dominantHsl.s / 100;

    // Calculate warmth (-1 to 1)
    const warmth = calculateWarmth(dominantHsl);

    return {
      dominantHex: dominant.hex,
      dominantHsl,
      palette: swatches.slice(0, 6), // Keep top 6 colors
      brightness,
      saturation,
      warmth,
    };
  } catch (error) {
    console.error(`Error extracting colors from ${imageUrl}:`, error);
    return null;
  }
}

async function processCards(setId?: string, limit?: number) {
  console.log("Starting color extraction for ChromaDex...\n");

  // Build query for cards without colors
  let query = supabase
    .from("cards")
    .select("id, image_large, image_small")
    .not("image_large", "is", null);

  if (setId) {
    query = query.eq("set_id", setId);
  }

  // Get cards that don't have colors yet
  const { data: allCards, error: cardsError } = await query;

  if (cardsError) {
    console.error("Error fetching cards:", cardsError.message);
    return;
  }

  if (!allCards || allCards.length === 0) {
    console.log("No cards found to process");
    return;
  }

  // Get existing color records
  const { data: existingColors } = await supabase
    .from("card_colors")
    .select("card_id");

  const existingCardIds = new Set(existingColors?.map(c => c.card_id) || []);

  // Filter to cards without colors
  const cardsToProcess = allCards.filter(c => !existingCardIds.has(c.id));

  // Apply limit if specified
  const cards = limit ? cardsToProcess.slice(0, limit) : cardsToProcess;

  console.log(`Processing ${cards.length} cards (${allCards.length - cardsToProcess.length} already have colors)\n`);

  let processed = 0;
  let errors = 0;

  for (const card of cards) {
    const imageUrl = card.image_large || card.image_small;
    if (!imageUrl) continue;

    process.stdout.write(`Processing ${card.id}... `);

    const colors = await extractColorsFromImage(imageUrl);

    if (colors) {
      const { error } = await supabase
        .from("card_colors")
        .upsert({
          card_id: card.id,
          dominant_hex: colors.dominantHex,
          dominant_hsl: colors.dominantHsl,
          palette: colors.palette,
          brightness: colors.brightness,
          saturation: colors.saturation,
          warmth: colors.warmth,
        }, { onConflict: "card_id" });

      if (error) {
        console.log(`ERROR: ${error.message}`);
        errors++;
      } else {
        console.log(`OK (${colors.dominantHex})`);
        processed++;
      }
    } else {
      console.log("SKIPPED (no colors extracted)");
      errors++;
    }

    // Rate limit to avoid overwhelming the image server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\nColor extraction complete!`);
  console.log(`Processed: ${processed}, Errors: ${errors}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
let setId: string | undefined;
let limit: number | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--set" && args[i + 1]) {
    setId = args[i + 1];
  }
  if (args[i] === "--limit" && args[i + 1]) {
    limit = parseInt(args[i + 1]);
  }
}

// Run the extraction
processCards(setId, limit).catch(console.error);
