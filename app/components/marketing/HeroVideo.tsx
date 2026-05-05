"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Play, X } from "lucide-react";

const VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;
const POSTER_URL =
  process.env.NEXT_PUBLIC_DEMO_VIDEO_POSTER_URL ||
  "/assets/media/hero_bg-B3Bwin3-.jpg";

export default function HeroVideo() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Play AccessCheck demo video"
          className="group relative block w-full aspect-[4/3] overflow-hidden bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-dark)] focus-visible:ring-offset-2"
        >
          <img
            src={POSTER_URL}
            alt="A modern living room being analysed by AccessCheck"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40"
          />
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-20 h-20 rounded-full bg-white/95 text-[var(--primary-dark)] shadow-lg ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110"
          >
            <Play size={32} className="ml-1" fill="currentColor" />
          </span>
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <DialogPrimitive.Title className="sr-only">
            AccessCheck demo video
          </DialogPrimitive.Title>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
            {VIDEO_URL ? (
              <video
                ref={videoRef}
                src={VIDEO_URL}
                poster={POSTER_URL}
                controls
                autoPlay
                playsInline
                className="h-full w-full"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm text-white/80">
                Demo video URL not configured.
              </div>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close video"
            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--text-main)] shadow-lg ring-1 ring-black/5 hover:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-dark)] focus-visible:ring-offset-2"
          >
            <X size={20} />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
