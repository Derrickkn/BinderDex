"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CoachMarkStep {
  target: string; // CSS selector for the target element
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface CoachMarksProps {
  steps: CoachMarkStep[];
  storageKey: string; // localStorage key to track if tutorial has been seen
  onComplete?: () => void;
  onRestart?: (restartFn: () => void) => void; // Callback to provide restart function to parent
}

export function CoachMarks({ steps, storageKey, onComplete, onRestart }: CoachMarksProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Restart function to be called externally
  const restart = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
      setCurrentStep(0);
      setIsVisible(true);
      setTimeout(() => {
        updateTargetPosition();
      }, 100);
    }
  }, [storageKey]);

  // Provide restart function to parent
  useEffect(() => {
    if (onRestart) {
      onRestart(restart);
    }
  }, [onRestart, restart]);

  useEffect(() => {
    // Check if tutorial has been seen (only run client-side)
    if (typeof window === "undefined") return;

    const hasSeenTutorial = localStorage.getItem(storageKey);
    if (!hasSeenTutorial) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsVisible(true);
        updateTargetPosition();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Add/remove body class for coach marks styling
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("coach-marks-active");
      // Add step-specific data attribute for targeting
      document.body.setAttribute("data-coach-step", currentStep.toString());
    } else {
      document.body.classList.remove("coach-marks-active");
      document.body.removeAttribute("data-coach-step");
    }

    return () => {
      document.body.classList.remove("coach-marks-active");
      document.body.removeAttribute("data-coach-step");
    };
  }, [isVisible, currentStep]);

  useEffect(() => {
    if (isVisible) {
      updateTargetPosition();

      // Auto-scroll to target if needed
      const step = steps[currentStep];
      if (step) {
        // Special handling for quick fill dropdown - click to open it
        if (step.target === "[data-coach-quick-fill-dropdown]") {
          const quickFillButton = document.querySelector("[data-coach-quick-fill]") as HTMLButtonElement;
          if (quickFillButton) {
            // Click to open dropdown
            quickFillButton.click();

            // Wait for dropdown to be positioned with multiple retries
            let retryCount = 0;
            const maxRetries = 10;
            const checkInterval = 100;

            const checkDropdown = () => {
              const dropdown = document.querySelector(step.target);
              if (dropdown) {
                // Dropdown found, wait a bit more for positioning to settle
                setTimeout(() => {
                  dropdown.scrollIntoView({ behavior: "smooth", block: "center" });
                  // Update position multiple times to handle async positioning
                  updateTargetPosition();
                  setTimeout(updateTargetPosition, 50);
                  setTimeout(updateTargetPosition, 150);
                  setTimeout(updateTargetPosition, 300);
                }, 50);
              } else if (retryCount < maxRetries) {
                // Retry
                retryCount++;
                setTimeout(checkDropdown, checkInterval);
              }
            };

            setTimeout(checkDropdown, 100);
          }
        } else {
          // For card slots, scroll to a visible one
          let element: Element | null = null;
          if (step.target === "[data-coach-card-slot]") {
            const allCardSlots = document.querySelectorAll(step.target);
            // Find first visible card slot
            for (const slot of Array.from(allCardSlots)) {
              const rect = slot.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                element = slot;
                break;
              }
            }
          } else {
            element = document.querySelector(step.target);
          }

          if (element) {
            // Smooth scroll to element with some offset for better visibility
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }

      window.addEventListener("resize", updateTargetPosition);
      window.addEventListener("scroll", updateTargetPosition);
      return () => {
        window.removeEventListener("resize", updateTargetPosition);
        window.removeEventListener("scroll", updateTargetPosition);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, currentStep]);

  const updateTargetPosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    let element: Element | null = null;

    // For card slots, find one that's actually visible in the viewport
    if (step.target === "[data-coach-card-slot]") {
      const allCardSlots = document.querySelectorAll(step.target);
      for (const slot of Array.from(allCardSlots)) {
        const rect = slot.getBoundingClientRect();
        // Check if element is in viewport and has non-zero dimensions
        if (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          element = slot;
          break;
        }
      }
      // Fallback to middle visible card if none fully in viewport
      if (!element && allCardSlots.length > 0) {
        const middleIndex = Math.floor(allCardSlots.length / 2);
        element = allCardSlots[middleIndex];
      }
    } else {
      // For other elements, use first match
      element = document.querySelector(step.target);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible || !targetRect) return null;

  const step = steps[currentStep];
  const position = step.position || "bottom";

  // Calculate tooltip position with viewport constraints
  const getTooltipStyle = (): React.CSSProperties => {
    // Use smaller padding for quick fill dropdown to reduce gap
    const padding = step.target === "[data-coach-quick-fill-dropdown]" ? 12 : 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320; // max-w-[calc(100vw-2rem)] = 320px on most screens
    const tooltipHeight = 200; // approximate height

    let left = targetRect.left + targetRect.width / 2;
    let top = 0;
    let transform = "";

    // Special positioning for quick fill dropdown - always to the right
    if (step.target === "[data-coach-quick-fill-dropdown]") {
      left = targetRect.right + padding;
      top = targetRect.top + targetRect.height / 2;
      transform = "translate(0, -50%)";
    } else {
      switch (position) {
        case "top":
          top = targetRect.top - padding;
          transform = "translate(-50%, -100%)";
          break;
        case "bottom":
          top = targetRect.bottom + padding;
          transform = "translate(-50%, 0)";
          break;
        case "left":
          left = targetRect.left - padding;
          top = targetRect.top + targetRect.height / 2;
          transform = "translate(-100%, -50%)";
          break;
        case "right":
          left = targetRect.right + padding;
          top = targetRect.top + targetRect.height / 2;
          transform = "translate(0, -50%)";
          break;
      }
    }

    // Constrain to viewport bounds
    const margin = 16; // 1rem

    // Calculate final position after transform
    let finalLeft = left;
    if (transform.includes("-50%")) {
      finalLeft = left - tooltipWidth / 2;
    } else if (transform.includes("-100%")) {
      finalLeft = left - tooltipWidth;
    }

    // Adjust if overflowing right
    if (finalLeft + tooltipWidth > viewportWidth - margin) {
      finalLeft = viewportWidth - tooltipWidth - margin;
      // Recalculate left to account for removed transform
      if (transform.includes("-50%")) {
        left = finalLeft + tooltipWidth / 2;
      } else if (transform.includes("-100%")) {
        left = finalLeft + tooltipWidth;
      } else {
        left = finalLeft;
      }
    }

    // Adjust if overflowing left
    if (finalLeft < margin) {
      finalLeft = margin;
      if (transform.includes("-50%")) {
        left = finalLeft + tooltipWidth / 2;
      } else if (transform.includes("-100%")) {
        left = finalLeft + tooltipWidth;
      } else {
        left = finalLeft;
      }
    }

    // Adjust if overflowing top
    let finalTop = top;
    if (transform.includes("-100%") && position === "top") {
      finalTop = top - tooltipHeight;
    } else if (transform.includes("-50%") && (position === "left" || position === "right")) {
      finalTop = top - tooltipHeight / 2;
    }

    if (finalTop < margin) {
      // Switch to bottom positioning if too close to top
      top = targetRect.bottom + padding;
      transform = transform.replace("-100%", "0");
    }

    // Adjust if overflowing bottom
    if (finalTop + tooltipHeight > viewportHeight - margin) {
      // Switch to top positioning if too close to bottom
      top = targetRect.top - padding;
      if (!transform.includes("-100%")) {
        transform = transform.replace("0", "-100%");
      }
    }

    return { left, top, transform };
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[100] transition-opacity"
        onClick={(e) => {
          // Prevent backdrop clicks from closing dropdown during quick fill step
          if (step.target === "[data-coach-quick-fill-dropdown]") {
            e.stopPropagation();
          }
        }}
      />

      {/* Highlight cutout */}
      <div
        className={cn(
          "fixed z-[101] pointer-events-none coach-mark-highlight",
          step.target === "[data-coach-card-slot]" && "coach-card-highlight"
        )}
        style={{
          left: targetRect.left - 4,
          top: targetRect.top - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.5)",
          borderRadius: "8px",
          border: "2px solid rgba(99, 102, 241, 0.8)",
        }}
      />

      {/* Additional highlight for quick fill button in step 3 */}
      {step.target === "[data-coach-quick-fill-dropdown]" && (() => {
        const button = document.querySelector("[data-coach-quick-fill]");
        if (button) {
          const buttonRect = button.getBoundingClientRect();
          return (
            <div
              className="fixed z-[101] pointer-events-none"
              style={{
                left: buttonRect.left - 4,
                top: buttonRect.top - 4,
                width: buttonRect.width + 8,
                height: buttonRect.height + 8,
                borderRadius: "8px",
                border: "2px solid rgba(99, 102, 241, 0.8)",
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
              }}
            />
          );
        }
        return null;
      })()}

      {/* Minimalist mouse cursor indicator for card steps */}
      {(currentStep === 0 || currentStep === 1) && (
        <div
          className="fixed z-[102] pointer-events-none"
          style={{
            left: targetRect.left + targetRect.width / 2,
            top: targetRect.top + targetRect.height / 2,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Minimalist hand cursor */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hand palm */}
            <path
              d="M16 26C16 26 12 25 10 23C8 21 8 18 8 18V10C8 9 8.5 8 9.5 8C10.5 8 11 9 11 10V16"
              stroke="#D4D4D8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Index finger - highlighted for left-click (step 0) */}
            <path
              d="M11 16V7C11 6 11.5 5 12.5 5C13.5 5 14 6 14 7V14"
              stroke={currentStep === 0 ? "#6366F1" : "#D4D4D8"}
              strokeWidth={currentStep === 0 ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={currentStep === 0 ? "rgba(99, 102, 241, 0.2)" : "none"}
            />
            {/* Middle finger */}
            <path
              d="M14 14V6C14 5 14.5 4 15.5 4C16.5 4 17 5 17 6V14"
              stroke={currentStep === 1 ? "#6366F1" : "#D4D4D8"}
              strokeWidth={currentStep === 1 ? "2.5" : "2"}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={currentStep === 1 ? "rgba(99, 102, 241, 0.2)" : "none"}
            />
            {/* Ring finger */}
            <path
              d="M17 14V7C17 6 17.5 5 18.5 5C19.5 5 20 6 20 7V16"
              stroke="#D4D4D8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Pinky */}
            <path
              d="M20 16V9C20 8 20.5 7 21.5 7C22.5 7 23 8 23 9V18C23 18 23 21 21 23C19 25 16 26 16 26"
              stroke="#D4D4D8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Click indicator text */}
            <text
              x="16"
              y="30"
              textAnchor="middle"
              fill="#6366F1"
              fontSize="5"
              fontWeight="600"
            >
              {currentStep === 0 ? "LEFT" : "RIGHT"}
            </text>
          </svg>
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[102] w-80 max-w-[calc(100vw-2rem)]"
        style={getTooltipStyle()}
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Close tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === currentStep
                      ? "w-6 bg-indigo-500"
                      : "w-1.5 bg-zinc-700"
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSkip}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
              >
                {currentStep < steps.length - 1 ? "Next" : "Got it"}
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="text-[10px] text-zinc-600 text-center mt-2">
            {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Arrow */}
        <div
          className={cn(
            "absolute w-0 h-0 border-8",
            // Quick fill dropdown always has left-pointing arrow
            step.target === "[data-coach-quick-fill-dropdown]" &&
              "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-zinc-700",
            // Other positions
            step.target !== "[data-coach-quick-fill-dropdown]" && position === "bottom" &&
              "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-zinc-700",
            step.target !== "[data-coach-quick-fill-dropdown]" && position === "top" &&
              "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-zinc-700",
            step.target !== "[data-coach-quick-fill-dropdown]" && position === "right" &&
              "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-zinc-700",
            step.target !== "[data-coach-quick-fill-dropdown]" && position === "left" &&
              "right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-zinc-700"
          )}
        />
      </div>
    </>
  );
}
