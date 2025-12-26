/**
 * Export-related types for missing cards export functionality
 */

export interface ExportCard {
  name: string;
  cardNumber: string;
  setId: string;
  fullSetNumber: string;
  rarity: string;
  variant: string;
  imageUrl: string;
}

export interface ExportData {
  cards: ExportCard[];
  totalCardsInSet: number;
  setName: string;
  setId: string;
}

export type ExportFormat = "pdf" | "excel";

export interface ExportOptions {
  format: ExportFormat;
  includeImages?: boolean; // Only applicable for PDF
}
