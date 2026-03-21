"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ImageIcon } from "lucide-react";

export function ProofImage({ url }: { url: string | null }) {
  const [open, setOpen] = useState(false);

  if (!url) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ImageIcon className="h-3 w-3" />
        No proof
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 transition-colors"
      >
        <ImageIcon className="h-3 w-3" />
        View Proof
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-background rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">Meter Reading Proof</span>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative w-full aspect-[4/3] bg-muted">
              <Image
                src={url}
                alt="Meter reading proof"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>

            <div className="px-4 py-3 border-t flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Submitted as proof of meter reading
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Open full image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
