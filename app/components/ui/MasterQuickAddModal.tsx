"use client";
import React, { useState } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface Props {
  type: "LINE" | "ROAD" | "BLOCK";
  parentCode: string;
  dept: string;
  label: string;
  onAdded: (code: string) => void;
  onClose: () => void;
}

export default function MasterQuickAddModal({ type, parentCode, dept, label, onAdded, onClose }: Props) {
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await axiosInstance.post("/api/master", {
        type,
        code: trimmed,
        label: trimmed,
        parent: parentCode,
        dept,
        active: true,
        sort: 999,
      });
      const userName = (session?.user as any)?.name || "Unknown user";
      toast.success(`"${trimmed}" added to master data by ${userName}`);
      onAdded(trimmed);
      onClose();
    } catch {
      toast.error("Failed to add. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-[420px] max-w-[95vw] flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[22px] font-bold text-gray-900 dark:text-white">
          Add new {type === "LINE" ? "Line" : type === "ROAD" ? "Road" : "Block Section"}
        </h3>
        <p className="text-[16px] text-gray-500 dark:text-gray-400">
          Under: <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        </p>
        <input
          autoFocus
          className="border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-[18px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
          placeholder={type === "LINE" ? "e.g. UP, DN, Road 5" : type === "ROAD" ? "e.g. Rd 7" : "e.g. XXX-YYY"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
        />
        <p className="text-[13px] text-amber-600 dark:text-amber-400">
          This will be saved to Master Data immediately and visible to all users.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-gray-300 text-gray-600 text-[16px] font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!code.trim() || saving}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white text-[16px] font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
