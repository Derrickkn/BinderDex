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
            // Wait a bit to ensure the button is ready
            setTimeout(() => {
              quickFillButton.click();
              // Keep checking if dropdown exists and retry if needed
              const checkDropdown = () => {
                const dropdown = document.querySelector(step.target);
                if (dropdown) {
                  dropdown.scrollIntoView({ behavior: "smooth", block: "center" });
                  updateTargetPosition();
                } else {
                  // Dropdown not found, try clicking again
                  setTimeout(() => {
                    quickFillButton.click();
                    setTimeout(() => {
                      const retryDropdown = document.querySelector(step.target);
                      if (retryDropdown) {
                        retryDropdown.scrollIntoView({ behavior: "smooth", block: "center" });
                        updateTargetPosition();
                      }
                    }, 150);
                  }, 100);
                }
              };
              setTimeout(checkDropdown, 100);
            }, 100);
          }
        } else {
          const element = document.querySelector(step.target);
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

    const element = document.querySelector(step.target);
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
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 320; // max-w-[calc(100vw-2rem)] = 320px on most screens
    const tooltipHeight = 200; // approximate height

    let left = targetRect.left + targetRect.width / 2;
    let top = 0;
    let transform = "";

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
          {/* Minimalist outline mouse cursor */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={currentStep === 0 ? "animate-click-left" : "animate-click-right"}
          >
            {/* Mouse outline body */}
            <path
              d="M20 6C15.5817 6 12 9.58172 12 14V24C12 28.4183 15.5817 32 20 32C24.4183 32 28 28.4183 28 24V14C28 9.58172 24.4183 6 20 6Z"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
            />

            {/* Left button shading - darker when pressed (step 0) */}
            <path
              d="M20 6C15.5817 6 12 9.58172 12 14V18H20V6Z"
              fill={currentStep === 0 ? "rgba(99, 102, 241, 0.4)" : "none"}
              stroke="#6366f1"
              strokeWidth="1.5"
            />

            {/* Right button shading - darker when pressed (step 1) */}
            <path
              d="M20 6C24.4183 6 28 9.58172 28 14V18H20V6Z"
              fill={currentStep === 1 ? "rgba(99, 102, 241, 0.4)" : "none"}
            />

            {/* Center divider line */}
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="18"
              stroke="#6366f1"
              strokeWidth="1.5"
            />

            {/* Scroll wheel */}
            <rect
              x="18"
              y="11"
              width="4"
              height="5"
              rx="2"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
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
            position === "bottom" &&
              "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-zinc-700",
            position === "top" &&
              "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-zinc-700",
            position === "right" &&
              "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-zinc-700",
            position === "left" &&
              "right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-zinc-700"
          )}
        />
      </div>
    </>
  );
}
