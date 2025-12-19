"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaUserPlus, FaSearch } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { depots: string[] }) => void;
  allStationCodes: string[];
}

export default function AddPcModal({
  isOpen,
  onClose,
  onSubmit,
  allStationCodes,
}: Props) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInput("");
      setSelected([]);
      setFiltered(allStationCodes);
      setError("");
      setShowDropdown(false);
    }
  }, [isOpen, allStationCodes]);

  useEffect(() => {
    setFiltered(
      allStationCodes.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) &&
          !selected.includes(s)
      )
    );
  }, [input, selected, allStationCodes]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addStation = (s: string) => {
    setSelected((prev) => [...prev, s]);
    setInput("");
    setShowDropdown(false);
  };

  const removeStation = (s: string) => {
    setSelected((prev) => prev.filter((x) => x !== s));
  };

  const handleInputFocus = () => {
    if (filtered.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim() !== "" && filtered.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected.length) {
      setError("Select at least one station");
      return;
    }
    
    // Close dropdown before submission
    setShowDropdown(false);
    
    await onSubmit({ depots: selected.map((s) => s.toUpperCase()) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
        <h2 className="text-xl font-bold text-center mb-4 flex justify-center gap-2">
          <FaUserPlus /> Add Stations
        </h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((s) => (
            <span
              key={s}
              className="bg-blue-100 px-3 py-1 rounded-full flex gap-2 items-center"
            >
              {s}
              <button onClick={() => removeStation(s)} className="text-red-600">
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input with dropdown */}
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className="w-full border rounded-lg pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search station"
          />
          
          {/* Dropdown */}
          {showDropdown && filtered.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 border border-t-0 bg-white max-h-48 overflow-y-auto rounded-b-lg shadow-lg z-10"
            >
              {filtered.map((s) => (
                <div
                  key={s}
                  onMouseDown={() => addStation(s)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer border-b last:border-b-0"
                >
                  {s}
                </div>
              ))}
            </div>
          )}
          
          {/* Message when no results */}
          {showDropdown && input.trim() !== "" && filtered.length === 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 border border-t-0 bg-white p-4 rounded-b-lg shadow-lg z-10 text-gray-500 text-center"
            >
              No stations found
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-5">
          <button
            onClick={onClose}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}