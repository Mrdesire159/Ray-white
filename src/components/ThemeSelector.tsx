import React from "react";

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => (
  <div
    className={`inline-flex items-center gap-2 text-neutral-600 ${compact ? "text-[11px]" : "text-xs"}`}
    aria-label="Site colors: charcoal and gold"
  >
    <span
      aria-hidden="true"
      className="h-3 w-3 rounded-full bg-[#22252A] border border-neutral-300"
    />
    <span
      aria-hidden="true"
      className="h-3 w-3 rounded-full bg-[#FFD200] border border-neutral-300"
    />
    <span>Charcoal &amp; Gold</span>
  </div>
);
