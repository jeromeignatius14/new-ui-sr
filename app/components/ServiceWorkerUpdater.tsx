"use client";

import { useEffect } from "react";

export default function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // When skipWaiting is true, a new SW activates immediately and fires
    // controllerchange. Reloading here ensures every open tab (and installed
    // PWA shortcut) picks up the new cached assets instead of serving stale ones.
    const reload = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", reload);

    // Also check if a waiting SW already exists on first load (e.g. user had
    // the tab open when the new deploy happened) and tell it to skip waiting.
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", reload);
    };
  }, []);

  return null;
}
