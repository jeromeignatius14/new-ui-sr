"use client";
import { useEffect, useRef, useState } from "react";

export function LoadingBar({ active }: { active: boolean }) {
  const [width, setWidth]     = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);

  useEffect(() => {
    const clearAll = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current)  clearTimeout(timeoutRef.current);
    };

    if (active) {
      clearAll();
      setVisible(true);
      setWidth(0);
      // Crawl from 0 → 85 % while waiting — fast at start, slows near 85
      intervalRef.current = setInterval(() => {
        setWidth(w => {
          if (w >= 85) { clearInterval(intervalRef.current!); return 85; }
          return w + (w < 30 ? 8 : w < 60 ? 4 : 1);
        });
      }, 120);
    } else {
      clearAll();
      // Snap to 100 % then fade out
      setWidth(100);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 350);
    }
    return clearAll;
  }, [active]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: "3px", zIndex: 9999, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%",
        width: `${width}%`,
        background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
        boxShadow: "0 0 8px rgba(124,58,237,0.6)",
        transition: active ? "width 0.12s linear" : "width 0.3s ease",
      }} />
    </div>
  );
}
