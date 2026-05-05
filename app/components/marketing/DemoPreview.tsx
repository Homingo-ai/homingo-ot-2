import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const POSTER_URL =
  process.env.NEXT_PUBLIC_DEMO_VIDEO_POSTER_URL ||
  "/assets/media/hero_bg-B3Bwin3-.jpg";

export default function DemoPreview() {
  return (
    <section
      aria-labelledby="demo-preview-heading"
      className="bg-white border-y border-[var(--border)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary-dark)]">
            Interactive demo
          </p>
          <h2
            id="demo-preview-heading"
            className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-main)] leading-[1.05]"
          >
            See AccessCheck in action
          </h2>
          <p className="mt-4 text-lg text-[var(--text-dim)]">
            Walk through a real assessment in minutes — no sign-up required.
          </p>
        </div>

        <Link
          href="/demo"
          aria-label="Open the interactive AccessCheck demo"
          className="group mt-12 block relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl bg-[var(--bg-surface)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-dark)] focus-visible:ring-offset-2"
        >
          <div className="relative aspect-video w-full">
            <img
              src={POSTER_URL}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid place-items-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 text-[var(--primary-dark)] shadow-lg ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110"
            >
              <Play size={36} className="ml-1" fill="currentColor" />
            </span>
            <span className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 inline-flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
              Try the interactive demo
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
