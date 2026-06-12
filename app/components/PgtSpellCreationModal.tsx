"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userRequestService } from "@/app/service/api/user-request";
import toast from "react-hot-toast";

interface Spell {
  demandTimeFrom: string;
  demandTimeTo: string;
}

interface Props {
  request: {
    id: string;
    divisionId?: string;
    pgtMinDuration?: number;
    pgtMinSpellDuration?: number;
    date?: string;
  };
  onClose: () => void;
}

export default function PgtSpellCreationModal({ request, onClose }: Props) {
  const queryClient = useQueryClient();
  const [spells, setSpells] = useState<Spell[]>([{ demandTimeFrom: "", demandTimeTo: "" }]);

  const mutation = useMutation({
    mutationFn: () => userRequestService.createPgtSpells(request.id, spells),
    onSuccess: () => {
      toast.success("Spells created and sanctioned successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create spells");
    },
  });

  const addSpell = () => setSpells((prev) => [...prev, { demandTimeFrom: "", demandTimeTo: "" }]);
  const removeSpell = (i: number) => setSpells((prev) => prev.filter((_, idx) => idx !== i));
  const updateSpell = (i: number, field: keyof Spell, value: string) => {
    setSpells((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const SUFFIXES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const totalMinutes = spells.reduce((acc, s) => {
    if (!s.demandTimeFrom || !s.demandTimeTo) return acc;
    const [fh, fm] = s.demandTimeFrom.split(":").map(Number);
    const [th, tm] = s.demandTimeTo.split(":").map(Number);
    const diff = (th * 60 + tm) - (fh * 60 + fm);
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const dateStr = request.date ? new Date(request.date).toISOString().slice(0, 10) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-[#2c3e50] mb-1">Create Spells</h2>
        <p className="text-sm text-gray-500 mb-4">
          Block <span className="font-semibold">{request.divisionId}</span>
          {request.pgtMinDuration ? ` · Min ${request.pgtMinDuration}h total` : ""}
          {request.pgtMinSpellDuration ? ` · Min ${request.pgtMinSpellDuration}h/spell` : ""}
        </p>

        <div className="space-y-3 mb-4">
          {spells.map((spell, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <span className="font-bold text-[#2c3e50] w-6 text-center">{SUFFIXES[i]}</span>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-gray-500">From</label>
                <input
                  type="datetime-local"
                  value={spell.demandTimeFrom}
                  onChange={(e) => updateSpell(i, "demandTimeFrom", e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs font-semibold text-gray-500">To</label>
                <input
                  type="datetime-local"
                  value={spell.demandTimeTo}
                  onChange={(e) => updateSpell(i, "demandTimeTo", e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full"
                />
              </div>
              {spells.length > 1 && (
                <button onClick={() => removeSpell(i)} className="text-red-500 font-bold text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addSpell}
          className="w-full border-2 border-dashed border-[#3498db] text-[#3498db] font-bold rounded-xl py-2 mb-4 hover:bg-blue-50 transition"
        >
          + Add Spell
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm">
          <span className="font-semibold">Total duration: </span>{totalHours}h
          {request.pgtMinDuration && Number(totalHours) < request.pgtMinDuration && (
            <span className="text-red-500 ml-2">(minimum {request.pgtMinDuration}h required)</span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-300 text-gray-600 font-bold rounded-xl py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || spells.some(s => !s.demandTimeFrom || !s.demandTimeTo)}
            className="flex-1 bg-[#2c3e50] text-white font-bold rounded-xl py-2 hover:bg-[#1a252f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Creating…" : `Sanction ${spells.length} Spell${spells.length > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
