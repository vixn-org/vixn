"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PhotoNavigationShortcutsProps {
  prevUrl?: string | null;
  nextUrl?: string | null;
  nextImageUrl?: string | null;
  prevImageUrl?: string | null;
}

export default function PhotoNavigationShortcuts({
  prevUrl,
  nextUrl,
  nextImageUrl,
  prevImageUrl,
}: PhotoNavigationShortcutsProps) {
  const router = useRouter();

  // Preload next and previous image binaries into browser cache
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (nextImageUrl) {
      const img = new Image();
      img.src = nextImageUrl;
    }
    if (prevImageUrl) {
      const img = new Image();
      img.src = prevImageUrl;
    }
  }, [nextImageUrl, prevImageUrl]);

  // Keyboard navigation: Left Arrow (prev), Right Arrow (next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevUrl) {
        e.preventDefault();
        router.push(prevUrl);
      } else if (e.key === "ArrowRight" && nextUrl) {
        e.preventDefault();
        router.push(nextUrl);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, prevUrl, nextUrl]);

  return null;
}
