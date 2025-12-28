/**
 * Browse Cards - Validation Schemas
 *
 * Zod schemas for validating browse-related server actions and inputs.
 */

import { z } from "zod"
import { createEnumSchema } from "./common"

/**
 * Schema for getAllCards server action
 * No input parameters required - fetches all unique cards
 */
export const getAllCardsSchema = z.object({
  // Future: could add optional filters here if we switch to server-side filtering
})

/**
 * Valid sort fields
 */
export const sortFieldSchema = createEnumSchema(
  ["name", "number", "rarity", "releaseDate"] as const,
  "sort field"
)

/**
 * Valid sort directions
 */
export const sortDirectionSchema = createEnumSchema(
  ["asc", "desc"] as const,
  "sort direction"
)

/**
 * Valid view modes
 */
export const viewModeSchema = createEnumSchema(
  ["grid", "list"] as const,
  "view mode"
)
