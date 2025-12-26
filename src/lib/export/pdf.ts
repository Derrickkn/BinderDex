import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExportCard } from "./types";
import { generateExportFilename } from "./formatters";

// Extend jsPDF type to include lastAutoTable
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Pokemon card dimensions in mm
const POKEMON_CARD_WIDTH = 63.5;
const POKEMON_CARD_HEIGHT = 88;

export interface PDFExportOptions {
  scaleForPrinting?: boolean; // Use exact Pokemon card dimensions
}

/**
 * Load an image and convert to base64
 * Returns null if loading fails
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Draw the BinderDex logo (simplified binder icon + text)
 */
function drawLogo(doc: jsPDF, x: number, y: number, scale: number = 1): number {
  // Logo dimensions
  const spineWidth = 1.5 * scale;
  const cellWidth = 4 * scale;
  const cellHeight = 4.5 * scale; // Slightly taller than wide (card shape)
  const cellGap = 0.4 * scale;
  const spineGap = 0.8 * scale;

  const gridWidth = 3 * cellWidth + 2 * cellGap;
  const gridHeight = 3 * cellHeight + 2 * cellGap;

  // Binder spine
  doc.setFillColor(31, 41, 55); // gray-800
  doc.roundedRect(x, y, spineWidth, gridHeight, 0.3, 0.3, "F");

  // Grid cells with colors matching the logo exactly
  // Row 1: gray-700, gray-600, indigo-500
  // Row 2: gray-600, pink-500, gray-600
  // Row 3: amber-500, gray-600, gray-700
  const colors: [number, number, number][][] = [
    [[55, 65, 81], [75, 85, 99], [99, 102, 241]],   // Row 1
    [[75, 85, 99], [236, 72, 153], [75, 85, 99]],   // Row 2
    [[245, 158, 11], [75, 85, 99], [55, 65, 81]],   // Row 3
  ];

  const gridX = x + spineWidth + spineGap;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = gridX + col * (cellWidth + cellGap);
      const cy = y + row * (cellHeight + cellGap);
      doc.setFillColor(...colors[row][col]);
      doc.roundedRect(cx, cy, cellWidth, cellHeight, 0.4, 0.4, "F");
    }
  }

  // Text "BinderDex"
  const textX = gridX + gridWidth + 3 * scale;
  const textY = y + gridHeight / 2 + 1.5 * scale;
  doc.setFontSize(11 * scale);
  doc.setFont("helvetica", "bold");

  // "Binder" in dark gray
  doc.setTextColor(55, 65, 81);
  doc.text("Binder", textX, textY);

  // "Dex" in gradient colors (indigo -> pink -> amber, use pink)
  const binderWidth = doc.getTextWidth("Binder");
  doc.setTextColor(236, 72, 153); // pink
  doc.text("Dex", textX + binderWidth, textY);

  // Return the total width used
  return textX + binderWidth + doc.getTextWidth("Dex") - x;
}

/**
 * Add minimal header to a page with logo
 */
function addPageHeader(
  doc: jsPDF,
  setName: string,
  pageNum: number,
  totalPages: number,
  margin: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw logo (left)
  drawLogo(doc, margin, 5, 1);

  // Set name (center)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const setNameWidth = doc.getTextWidth(setName);
  doc.text(setName, (pageWidth - setNameWidth) / 2, 12);

  // Page number (right)
  doc.setTextColor(120, 120, 120);
  const pageText = `${pageNum}/${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - margin - pageTextWidth, 12);

  // Return Y position after header
  return 20;
}

/**
 * Generate and download a PDF with missing cards (grid with images)
 */
export async function generateMissingCardsPDF(
  cards: ExportCard[],
  setName: string,
  includeImages: boolean = true,
  onProgress?: (current: number, total: number) => void,
  options?: PDFExportOptions
): Promise<void> {
  const scaleForPrinting = options?.scaleForPrinting ?? false;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = scaleForPrinting ? 5 : 10;

  // Card dimensions based on mode
  let cardWidth: number;
  let cardHeight: number;
  let cardSpacingX: number;
  let cardSpacingY: number;
  let labelHeight: number;

  if (scaleForPrinting) {
    // Exact Pokemon card dimensions for printing/cutting
    cardWidth = POKEMON_CARD_WIDTH;
    cardHeight = POKEMON_CARD_HEIGHT;
    cardSpacingX = 2;
    cardSpacingY = 2;
    labelHeight = 0; // No labels in print mode - just the cards
  } else {
    // Optimized for viewing/reference
    cardWidth = 28;
    cardHeight = 39;
    cardSpacingX = 4;
    cardSpacingY = 3;
    labelHeight = 10;
  }

  // Calculate grid
  const usableWidth = pageWidth - 2 * margin;
  const headerHeight = 20;
  const usableHeight = pageHeight - margin - headerHeight;
  const cardsPerRow = Math.floor((usableWidth + cardSpacingX) / (cardWidth + cardSpacingX));
  const rowHeight = cardHeight + labelHeight + cardSpacingY;
  const rowsPerPage = Math.floor(usableHeight / rowHeight);
  const cardsPerPage = cardsPerRow * rowsPerPage;

  // Calculate total pages
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  let currentPage = 1;
  let startY = addPageHeader(doc, setName, currentPage, totalPages, margin);
  let currentX = margin;
  let currentY = startY;
  let cardsInCurrentRow = 0;
  let rowsOnCurrentPage = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    // Report progress
    if (onProgress) {
      onProgress(i + 1, cards.length);
    }

    // Check if we need a new row
    if (cardsInCurrentRow >= cardsPerRow) {
      currentY += rowHeight;
      currentX = margin;
      cardsInCurrentRow = 0;
      rowsOnCurrentPage++;
    }

    // Check if we need a new page
    if (rowsOnCurrentPage >= rowsPerPage) {
      doc.addPage();
      currentPage++;
      startY = addPageHeader(doc, setName, currentPage, totalPages, margin);
      currentY = startY;
      currentX = margin;
      cardsInCurrentRow = 0;
      rowsOnCurrentPage = 0;
    }

    // Try to load and add the image
    if (includeImages && card.imageUrl) {
      const imageData = await loadImageAsBase64(card.imageUrl);
      if (imageData) {
        try {
          doc.addImage(
            imageData,
            "JPEG",
            currentX,
            currentY,
            cardWidth,
            cardHeight
          );

          // Add cut lines for print mode
          if (scaleForPrinting) {
            drawCutMarks(doc, currentX, currentY, cardWidth, cardHeight);
          }
        } catch {
          drawPlaceholder(doc, currentX, currentY, cardWidth, cardHeight, card.cardNumber, scaleForPrinting);
        }
      } else {
        drawPlaceholder(doc, currentX, currentY, cardWidth, cardHeight, card.cardNumber, scaleForPrinting);
      }
    } else {
      drawPlaceholder(doc, currentX, currentY, cardWidth, cardHeight, card.cardNumber, scaleForPrinting);
    }

    // Add card info below image (only in non-print mode)
    if (!scaleForPrinting) {
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);

      const maxNameLength = 16;
      const displayName = card.name.length > maxNameLength
        ? card.name.substring(0, maxNameLength - 1) + "…"
        : card.name;

      doc.text(displayName, currentX, currentY + cardHeight + 3.5);

      doc.setFontSize(5);
      doc.setTextColor(120, 120, 120);
      let infoText = `#${card.cardNumber} · ${card.rarity}`;
      if (card.variant !== "Normal") {
        infoText += ` · ${card.variant}`;
      }
      if (infoText.length > 22) {
        infoText = infoText.substring(0, 21) + "…";
      }
      doc.text(infoText, currentX, currentY + cardHeight + 7);
    }

    currentX += cardWidth + cardSpacingX;
    cardsInCurrentRow++;
  }

  // Save the PDF
  const filename = generateExportFilename(setName, "pdf");
  doc.save(filename);
}

/**
 * Draw subtle cut marks at corners for print mode
 */
function drawCutMarks(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const markLength = 3;
  const offset = 0.5;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.1);

  // Top-left corner
  doc.line(x - offset, y - offset, x - offset - markLength, y - offset);
  doc.line(x - offset, y - offset, x - offset, y - offset - markLength);

  // Top-right corner
  doc.line(x + width + offset, y - offset, x + width + offset + markLength, y - offset);
  doc.line(x + width + offset, y - offset, x + width + offset, y - offset - markLength);

  // Bottom-left corner
  doc.line(x - offset, y + height + offset, x - offset - markLength, y + height + offset);
  doc.line(x - offset, y + height + offset, x - offset, y + height + offset + markLength);

  // Bottom-right corner
  doc.line(x + width + offset, y + height + offset, x + width + offset + markLength, y + height + offset);
  doc.line(x + width + offset, y + height + offset, x + width + offset, y + height + offset + markLength);
}

/**
 * Draw a placeholder box for missing images
 */
function drawPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  cardNumber: string,
  scaleForPrinting: boolean = false
): void {
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(x, y, width, height, scaleForPrinting ? 3 : 1.5, scaleForPrinting ? 3 : 1.5, "FD");

  doc.setFontSize(scaleForPrinting ? 14 : 8);
  doc.setTextColor(160, 160, 160);
  doc.text(`#${cardNumber}`, x + width / 2, y + height / 2, { align: "center" });

  if (scaleForPrinting) {
    drawCutMarks(doc, x, y, width, height);
  }
}

/**
 * Add minimal page number only (for continued pages)
 */
function addPageNumberOnly(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  margin: number
): void {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Page number (right aligned at top)
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const pageText = `${pageNum}/${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - margin - pageTextWidth, 10);
}

/**
 * Generate PDF without images (table format only, faster)
 * Uses 2-column layout for space efficiency
 */
export function generateMissingCardsPDFSimple(
  cards: ExportCard[],
  setName: string,
  totalCardsInSet?: number
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 8;
  const columnGap = 6;
  const columnWidth = (pageWidth - 2 * margin - columnGap) / 2;

  // Format card number as "num/total" (e.g., "1/132")
  const formatCardNum = (cardNumber: string) => {
    if (totalCardsInSet) {
      return `${cardNumber}/${totalCardsInSet}`;
    }
    return cardNumber;
  };

  // Prepare table data
  const tableData = cards.map((card) => [
    formatCardNum(card.cardNumber),
    card.name,
    card.rarity,
    card.variant !== "Normal" ? card.variant : "-",
  ]);

  // Split data into two columns
  const rowsPerColumn = 45; // Compact rows
  const rowsPerPage = rowsPerColumn * 2; // Two columns per page
  const totalPages = Math.ceil(cards.length / rowsPerPage);

  let currentPage = 1;
  let dataIndex = 0;

  while (dataIndex < tableData.length) {
    if (currentPage > 1) {
      doc.addPage();
    }

    // Add header only on first page, page number on others
    let startY: number;
    if (currentPage === 1) {
      startY = addPageHeader(doc, setName, currentPage, totalPages, margin);
    } else {
      addPageNumberOnly(doc, currentPage, totalPages, margin);
      startY = 14;
    }

    // Left column
    const leftColumnData = tableData.slice(dataIndex, dataIndex + rowsPerColumn);
    if (leftColumnData.length > 0) {
      autoTable(doc, {
        startY: startY,
        head: [["#", "Card Name", "Rarity", "Variant"]],
        body: leftColumnData,
        margin: { left: margin, right: pageWidth - margin - columnWidth },
        tableWidth: columnWidth,
        styles: {
          fontSize: 7,
          cellPadding: 1,
          overflow: "ellipsize",
        },
        headStyles: {
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 14 },      // # (e.g., "1/132")
          1: { cellWidth: "auto" },  // Card Name
          2: { cellWidth: 18 },      // Rarity
          3: { cellWidth: 16 },      // Variant
        },
      });
    }

    // Right column
    const rightColumnData = tableData.slice(dataIndex + rowsPerColumn, dataIndex + rowsPerPage);
    if (rightColumnData.length > 0) {
      autoTable(doc, {
        startY: startY,
        head: [["#", "Card Name", "Rarity", "Variant"]],
        body: rightColumnData,
        margin: { left: margin + columnWidth + columnGap, right: margin },
        tableWidth: columnWidth,
        styles: {
          fontSize: 7,
          cellPadding: 1,
          overflow: "ellipsize",
        },
        headStyles: {
          fillColor: [80, 80, 80],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 14 },      // # (e.g., "1/132")
          1: { cellWidth: "auto" },  // Card Name
          2: { cellWidth: 18 },      // Rarity
          3: { cellWidth: 16 },      // Variant
        },
      });
    }

    dataIndex += rowsPerPage;
    currentPage++;
  }

  // Save
  const filename = generateExportFilename(setName, "pdf");
  doc.save(filename);
}
