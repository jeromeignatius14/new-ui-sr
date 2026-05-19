"use client";

import { useEffect } from "react";

export default function ServiceWorkerUpdater() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // skipWaiting:true in next-pwa means the new SW activates immediately
    // and fires controllerchange. Reloading ensures the tab picks up new code.
    // NOTE: the inline <script> in layout.tsx catches this BEFORE React loads,
    // covering old PWA installs that don't have this component yet.
    const reload = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", reload);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", reload);
    };
  }, []);

  return null;
}
