"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function MasterDataPage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const token = (session?.user as any)?.token;
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function fetchSections() {
    try {
      const res = await fetch(`${apiUrl}/api/master?type=MAJOR`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) setSections(data.data);
    } catch {
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchSections();
  }, [token]);

  async function handleAdd() {
    if (!newCode.trim()) return toast.error("Code required");
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/master`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "MAJOR",
          code: newCode.trim().toUpperCase(),
          label: newLabel.trim() || newCode.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (data.status) {
        toast.success("Section added");
        setNewCode("");
        setNewLabel("");
        setAdding(false);
        fetchSections();
      } else {
        toast.error(data.message || "Failed to add");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete section ${code}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/master/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) {
        toast.success(`${code} deleted`);
        fetchSections();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fffbe9]">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="w-full border border-black bg-yellow-200 flex items-center justify-center relative p-3">
        <Link href="/admin" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-blue-700 underline">
          Back
        </Link>
        <span className="text-xl font-bold text-black">Manage Master Sections</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-gray-600 mb-4 text-sm">
          Add or remove major railway sections for this division. Changes here will reflect in the block request system.
        </p>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="mb-4 bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-800 transition"
          >
            + Add Section
          </button>
        )}

        {adding && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Section Code *</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. PGT-SRR"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Label (optional)</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Display name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setAdding(false); setNewCode(""); setNewLabel(""); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading sections...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-3 font-bold border-b border-gray-200 w-8 text-gray-500">#</th>
                  <th className="px-4 py-3 font-bold border-b border-gray-200">Code</th>
                  <th className="px-4 py-3 font-bold border-b border-gray-200">Label</th>
                  <th className="px-4 py-3 font-bold border-b border-gray-200 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s, idx) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">{s.code}</td>
                    <td className="px-4 py-3 text-gray-600">{s.label || s.code}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(s.id, s.code)}
                        className="bg-red-50 text-red-600 border border-red-200 rounded-md px-3 py-1 text-xs font-semibold hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No sections found. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Total: {sections.length} section{sections.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
