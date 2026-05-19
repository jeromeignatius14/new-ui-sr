"use client";
import React, { useState, KeyboardEvent } from "react";

interface StationCodeInputProps {
  value: string; // comma-separated station codes, e.g. "QLN,VAK,TVC"
  onChange: (val: string) => void;
  required?: boolean;
}

/**
 * Multi-station tag input.
 * Internally stores codes as a comma-separated string (matching the existing `depot` field convention).
 */
export default function StationCodeInput({ value, onChange, required }: StationCodeInputProps) {
  const [inputVal, setInputVal] = useState("");

  const codes = value
    ? value.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  function addCode(raw: string) {
    const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!code) return;
    if (codes.includes(code)) { setInputVal(""); return; }
    onChange([...codes, code].join(","));
    setInputVal("");
  }

  function removeCode(code: string) {
    onChange(codes.filter(c => c !== code).join(","));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addCode(inputVal);
    }
    if (e.key === "Backspace" && !inputVal && codes.length > 0) {
      removeCode(codes[codes.length - 1]);
    }
  }

  return (
    <div>
      <label className="block font-semibold mb-1">Station Code(s)</label>
      <div
        className="w-full border border-black rounded px-2 py-1 flex flex-wrap gap-1 min-h-[36px] cursor-text"
        onClick={() => document.getElementById("station-tag-input")?.focus()}
      >
        {codes.map(code => (
          <span
            key={code}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-bold px-2 py-0.5 rounded"
          >
            {code}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeCode(code); }}
              className="text-blue-500 hover:text-red-600 font-bold leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="station-tag-input"
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputVal) addCode(inputVal); }}
          className="outline-none flex-1 min-w-[80px] text-sm"
          placeholder={codes.length === 0 ? "Type code, press Enter" : "Add another…"}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Type a station code and press Enter (or comma) to add. Multiple stations allowed.</p>
      {/* Hidden required-guard */}
      {required && (
        <input
          tabIndex={-1}
          style={{ opacity: 0, height: 0, position: "absolute" }}
          required
          value={value}
          onChange={() => {}}
        />
      )}
    </div>
  );
}
