"use client";

import { useEffect } from "react";

// Lets a component accept Ctrl+V / Cmd+V pasted images (e.g. a screenshot
// or a copied image) as if they'd been picked via a file input.
//
// Pass `enabled` so it only listens while the relevant upload area/form is
// actually open or focused — otherwise pasting text anywhere else on the
// page would fight with it. `onImage` receives a real File object, same
// shape as what a file input's onChange gives you.
export function usePasteImage(enabled, onImage) {
  useEffect(() => {
    if (!enabled) return;

    function handlePaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            onImage(file);
          }
          break;
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [enabled, onImage]);
}