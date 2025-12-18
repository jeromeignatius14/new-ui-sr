"use client";

import React, { useState, useEffect, useRef } from "react"; 
import { FaUserPlus, FaSearch } from "react-icons/fa";
import { blockSection } from "@/app/lib/store"; // Import only blockSection

interface AddPcModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

// Function to extract all unique station codes from blockSection
const getAllStationCodes = () => {
  const stationSet = new Set<string>();
  
  Object.values(blockSection).forEach(sectionArray => {
    sectionArray.forEach(station => {
      // Skip "-YD" stations and split the station codes
      if (!station.endsWith('-YD')) {
        const stations = station.split('-');
        stations.forEach(code => {
          // Clean up any trailing spaces or special characters
          const cleanCode = code.trim()
            .replace(/\s*Jn\s*/gi, '') // Remove "Jn" text
            .replace(/\s*Jn$/, '') // Remove "Jn" at the end
            .replace(/\/.*$/, ''); // Remove anything after slash
          if (cleanCode && cleanCode !== 'YD') {
            stationSet.add(cleanCode);
          }
        });
      }
    });
  });
  
  return Array.from(stationSet).sort((a, b) => a.localeCompare(b));
};

export default function AddPcModal({ 
    isOpen, 
    onClose, 
    onSubmit
}: AddPcModalProps) {
    const [depot, setDepot] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [filteredStations, setFilteredStations] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get all unique stations from blockSection
    const allStationCodes = getAllStationCodes();

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setInputValue("");
            setDepot("");
            setFilteredStations(allStationCodes);
        }
    }, [isOpen]);

    // Filter stations based on input
    useEffect(() => {
        if (inputValue.trim() === "") {
            setFilteredStations(allStationCodes);
        } else {
            const filtered = allStationCodes.filter(station =>
                station.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredStations(filtered);
        }
    }, [inputValue]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setDepot("");
        setInputValue("");
        setSubmitting(false);
        setError(null);
        setShowDropdown(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setDepot(value); // Also update depot for submission
        setShowDropdown(true);
    };

    const handleStationSelect = (station: string) => {
        setInputValue(station);
        setDepot(station);
        setShowDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        if (!depot.trim()) {
            setError("Please enter a station code");
            setSubmitting(false);
            return;
        }

        try {
            await onSubmit({ depot: depot.toUpperCase() });
            resetForm();
            onClose();
        } catch (error: any) {
            console.error(error);
            setError("Failed to add station");
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 backdrop-blur-sm text-black">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
                    <FaUserPlus /> Add Station
                </h2>
                
                {error && (
                    <div className="text-center text-red-600 font-bold text-base mb-2 p-2 bg-red-50 rounded">
                        {error}
                    </div>
                )}
                
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <div className="relative" ref={dropdownRef}>
                        <label className="block font-semibold mb-1">
                            Station Code <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <FaSearch />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Type or select a station code..."
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                autoComplete="off"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInputValue("");
                                        setDepot("");
                                        setFilteredStations(allStationCodes);
                                        inputRef.current?.focus();
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Dropdown for stations */}
                        {showDropdown && filteredStations.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredStations.map((station) => (
                                    <div
                                        key={station}
                                        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${depot === station ? 'bg-blue-100' : ''}`}
                                        onClick={() => handleStationSelect(station)}
                                    >
                                        <div className="font-medium">{station}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No results message */}
                        {showDropdown && inputValue && filteredStations.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                                <div className="text-gray-500 text-center">
                                     {`No stations found for "${inputValue}"`}
                                </div>
                                <div className="text-sm text-gray-400 text-center mt-1">
                                    Try a different code
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                                {filteredStations.length} of {allStationCodes.length} stations available
                            </p>
                        </div>
                    </div>

                    {/* Selected station preview */}
                    {depot && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-gray-600">Selected Station:</div>
                            <div className="text-lg font-bold text-blue-700">{depot.toUpperCase()}</div>
                        </div>
                    )}
                    
                    <div className="flex justify-center gap-4 mt-6 pt-4 ">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded-lg transition duration-300 font-medium"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-300 font-medium ${
                                submitting || !depot.trim() ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={submitting || !depot.trim()}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                            ) : "Add Station"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}