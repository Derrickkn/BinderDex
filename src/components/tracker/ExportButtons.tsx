"use client";

import { useState, useRef, useEffect } from "react";
import { FileSpreadsheet, Loader2, ImageIcon, List, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackerCard } from "@/lib/types/tracker";
import { formatMissingCardsForExport } from "@/lib/export/formatters";
import { generateMissingCardsExcel } from "@/lib/export/excel";
import { generateMissingCardsPDF, generateMissingCardsPDFSimple } from "@/lib/export/pdf";
import { getMissingCards } from "@/lib/tracker/utils";

interface ExportButtonsProps {
  cards: TrackerCard[];
  setId: string;
  setName: string;
  totalCardsInSet?: number;
}

type ExportType = "pdf" | "pdf-print" | "pdf-simple" | "excel" | null;

export function ExportButtons({ cards, setId, setName, totalCardsInSet }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<ExportType>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printReady, setPrintReady] = useState(false);
  const [listColumns, setListColumns] = useState<1 | 2>(2); // Default to 2 columns to save paper
  const settingsRef = useRef<HTMLDivElement>(null);

  const missingCards = getMissingCards(cards);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (missingCards.length === 0) {
    return null;
  }

  const handleExportExcel = async () => {
    setIsExporting("excel");
    try {
      const exportData = formatMissingCardsForExport(missingCards, setId);
      generateMissingCardsExcel(exportData, setName);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDFWithImages = async () => {
    setIsExporting(printReady ? "pdf-print" : "pdf");
    setProgress({ current: 0, total: missingCards.length });
    try {
      const exportData = formatMissingCardsForExport(missingCards, setId);
      await generateMissingCardsPDF(
        exportData,
        setName,
        true,
        (current, total) => {
          setProgress({ current, total });
        },
        { scaleForPrinting: printReady }
      );
    } finally {
      setIsExporting(null);
      setProgress(null);
    }
  };

  const handleExportPDFSimple = async () => {
    setIsExporting("pdf-simple");
    try {
      const exportData = formatMissingCardsForExport(missingCards, setId);
      generateMissingCardsPDFSimple(exportData, setName, totalCardsInSet, listColumns);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div data-coach-export className="flex flex-wrap items-center gap-1.5">
      {/* PDF with Images */}
      <ExportButton
        onClick={handleExportPDFWithImages}
        isLoading={isExporting === "pdf" || isExporting === "pdf-print"}
        disabled={isExporting !== null}
        icon={<ImageIcon className="h-3.5 w-3.5" />}
        progress={["pdf", "pdf-print"].includes(isExporting || "") && progress ? progress : undefined}
      >
        PDF
      </ExportButton>

      {/* PDF List */}
      <ExportButton
        onClick={handleExportPDFSimple}
        isLoading={isExporting === "pdf-simple"}
        disabled={isExporting !== null}
        icon={<List className="h-3.5 w-3.5" />}
      >
        List
      </ExportButton>

      {/* Excel */}
      <ExportButton
        onClick={handleExportExcel}
        isLoading={isExporting === "excel"}
        disabled={isExporting !== null}
        icon={<FileSpreadsheet className="h-3.5 w-3.5" />}
      >
        Excel
      </ExportButton>

      {/* Settings gear */}
      <div className="relative" ref={settingsRef}>
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md border transition-colors",
            settingsOpen
              ? "bg-zinc-700 border-zinc-600 text-white"
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700"
          )}
          title="Export settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Settings modal */}
        {settingsOpen && (
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Export Settings</span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Print-ready option */}
              <div className="space-y-1.5">
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={printReady}
                    onChange={(e) => setPrintReady(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-900"
                  />
                  <div>
                    <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">
                      Print-ready PDF
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Export cards at actual size (2.5&quot; × 3.5&quot;) for printing and cutting as placeholders
                    </p>
                  </div>
                </label>
              </div>

              {/* Info about current state */}
              {printReady && (
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-emerald-900/20 border border-emerald-800/30">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-400">
                    PDF export will use print-ready dimensions
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-zinc-800" />

              {/* List column layout option */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-zinc-300">List Export Layout</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setListColumns(1)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border",
                      listColumns === 1
                        ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-750"
                    )}
                  >
                    1 Column
                  </button>
                  <button
                    onClick={() => setListColumns(2)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors border",
                      listColumns === 2
                        ? "bg-emerald-900/30 border-emerald-700 text-emerald-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-750"
                    )}
                  >
                    2 Columns
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  {listColumns === 1
                    ? "Easier to read, uses more paper"
                    : "Saves paper, more compact layout"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ExportButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  progress?: { current: number; total: number };
  className?: string;
}

function ExportButton({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  icon,
  progress,
  className,
}: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
        "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white",
        "border border-zinc-700 transition-colors",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {progress ? (
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          ) : (
            <span>...</span>
          )}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
