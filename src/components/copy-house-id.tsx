"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyHouseId({ houseId }: { houseId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(houseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = houseId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 w-full text-left group"
      title="Click to copy"
    >
      <div className="text-sm font-mono bg-muted/50 p-2 rounded-lg truncate flex-1 group-hover:bg-muted transition-colors duration-200">
        {houseId.slice(0, 8)}...{houseId.slice(-4)}
      </div>
      <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${
        copied
          ? "bg-green-500/10 text-green-500"
          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      }`}>
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </div>
    </button>
  );
}
