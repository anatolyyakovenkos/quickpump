"use client";

import type { Platform } from "@/lib/constants";

interface PlatformToggleProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  disabled?: boolean;
}

export default function PlatformToggle({ value, onChange, disabled }: PlatformToggleProps) {
  return (
    <div className="flex rounded-lg border border-border p-1 gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("pumpfun")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === "pumpfun"
            ? "bg-green-600 text-white"
            : "text-muted-foreground hover:text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        pump.fun
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("bonkfun")}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          value === "bonkfun"
            ? "bg-orange-500 text-white"
            : "text-muted-foreground hover:text-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        bonk.fun
      </button>
    </div>
  );
}
