"use client";

import { useEffect, useState } from "react";

export default function AddToHomeScreenPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      console.log("✅ beforeinstallprompt event captured");
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Trigger prompt on first interaction
  useEffect(() => {
    if (!promptEvent || hasPrompted) return;

    const interactionHandler = () => {
      window.removeEventListener("click", interactionHandler);
      window.removeEventListener("touchstart", interactionHandler);
      // Must call prompt() synchronously within the user gesture handler
      try {
        promptEvent.prompt();
        promptEvent.userChoice.then((result: any) => {
          setHasPrompted(true);
          setPromptEvent(null);
        });
      } catch (error) {
        console.error("❌ Error showing A2HS prompt:", error);
      }
    };

    window.addEventListener("click", interactionHandler);
    window.addEventListener("touchstart", interactionHandler);

    return () => {
      window.removeEventListener("click", interactionHandler);
      window.removeEventListener("touchstart", interactionHandler);
    };
  }, [promptEvent, hasPrompted]);

  return null;
}
