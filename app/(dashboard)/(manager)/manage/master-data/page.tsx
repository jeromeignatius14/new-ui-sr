"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance";

type SectionType = "MAJOR" | "BLOCK" | "DEPOT";

interface MasterSection {
  id: string;
  type: SectionType;
  code: string;
  label: string | null;
  parent: string | null;
  dept: string | null;
  sort: number;
  active: boolean;
}

interface LogEntry {
  action: "ADD" | "EDIT" | "DELETE";
  type: SectionType;
  code: string;
  detail: string;
  user: string;
  time: string;
}

const DEPTS = ["ENGG", "S&T", "TRD"];
const DEPT_COLORS: Record<string, string> = {
  ENGG: "bg-green-100 text-green-800 border-green-300",
  "S&T": "bg-blue-100 text-blue-800 border-blue-300",
  TRD: "bg-orange-100 text-orange-800 border-orange-300",
};

export default function MasterDataPage() {
  const { data: session } = useSession();
  const [allSections, setAllSections] = useState<MasterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"sections" | "log">("sections");

  // Modal
  const [modal, setModal] = useState<{
    mode: "add-major" | "add-block" | "add-depot" | "edit";
    parent?: string;
    dept?: string;
    item?: MasterSection;
  } | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formDept, setFormDept] = useState("ENGG");
  const [saving, setSaving] = useState(false);

  const userName =
    (session?.user as any)?.name ||
    (session?.user as any)?.email ||
    "Unknown User";

  function pushLog(
    action: "ADD" | "EDIT" | "DELETE",
    type: SectionType,
    code: string,
    detail: string
  ) {
    setLog((prev) => [
      {
        action,
        type,
        code,
        detail,
        user: userName,
        time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      },
      ...prev,
    ]);
  }

  async function fetchAll() {
    try {
      setLoading(true);
      const [majRes, blkRes, depRes] = await Promise.all([
        axiosInstance.get("/api/master?type=MAJOR"),
        axiosInstance.get("/api/master?type=BLOCK"),
        axiosInstance.get("/api/master?type=DEPOT"),
      ]);
      setAllSections([
        ...(majRes.data.data ?? []),
        ...(blkRes.data.data ?? []),
        ...(depRes.data.data ?? []),
      ]);
    } catch {
      toast.error("Failed to load master data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const majorSections = allSections
    .filter((s) => s.type === "MAJOR")
    .sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));

  function blocksFor(majorCode: string) {
    return allSections
      .filter((s) => s.type === "BLOCK" && s.parent === majorCode)
      .sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));
  }

  function depotsFor(majorCode: string) {
    return allSections
      .filter((s) => s.type === "DEPOT" && s.parent === majorCode)
      .sort((a, b) => (a.dept ?? "").localeCompare(b.dept ?? "") || a.code.localeCompare(b.code));
  }

  function toggleExpand(code: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function openAddMajor() {
    setFormCode("");
    setFormLabel("");
    setModal({ mode: "add-major" });
  }

  function openAddBlock(majorCode: string) {
    setFormCode("");
    setFormLabel("");
    setModal({ mode: "add-block", parent: majorCode });
  }

  function openAddDepot(majorCode: string) {
    setFormCode("");
    setFormLabel("");
    setFormDept("ENGG");
    setModal({ mode: "add-depot", parent: majorCode });
  }

  function openEdit(item: MasterSection) {
    setFormCode(item.code);
    setFormLabel(item.label ?? "");
    setFormDept(item.dept ?? "ENGG");
    setModal({ mode: "edit", item });
  }

  async function handleSave() {
    const code = formCode.trim().toUpperCase();
    if (!code) return toast.error("Code is required");
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.mode === "edit" && modal.item) {
        const res = await axiosInstance.put(`/api/master/${modal.item.id}`, {
          code,
          label: formLabel.trim() || code,
          ...(modal.item.type === "DEPOT" && { dept: formDept }),
        });
        if (res.data.status) {
          toast.success("Updated");
          pushLog("EDIT", modal.item.type, code, `Edited: ${modal.item.code} → ${code}`);
          setModal(null);
          fetchAll();
        } else {
          toast.error(res.data.message || "Failed");
        }
      } else {
        const typeMap: Record<string, SectionType> = {
          "add-major": "MAJOR",
          "add-block": "BLOCK",
          "add-depot": "DEPOT",
        };
        const type = typeMap[modal.mode];
        const payload: any = {
          type,
          code,
          label: formLabel.trim() || code,
          ...(modal.parent && { parent: modal.parent }),
          ...(type === "DEPOT" && { dept: formDept }),
        };
        const res = await axiosInstance.post("/api/master", payload);
        if (res.data.status) {
          toast.success("Added");
          pushLog("ADD", type, code, `Added under ${modal.parent ?? "root"}`);
          setModal(null);
          fetchAll();
        } else {
          toast.error(res.data.message || "Failed");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: MasterSection) {
    const kind =
      item.type === "MAJOR"
        ? "major section"
        : item.type === "BLOCK"
        ? "block section"
        : "depot";
    if (!confirm(`Delete ${kind} "${item.code}"? This cannot be undone.`))
      return;
    try {
      const res = await axiosInstance.delete(`/api/master/${item.id}`);
      if (res.data.status) {
        toast.success(`Deleted: ${item.code}`);
        pushLog("DELETE", item.type, item.code, `Deleted from ${item.parent ?? "root"}`);
        fetchAll();
      } else {
        toast.error(res.data.message || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  }

  const modalTitle =
    modal?.mode === "add-major"
      ? "Add Major Section"
      : modal?.mode === "add-block"
      ? `Add Block Section under ${modal.parent}`
      : modal?.mode === "add-depot"
      ? `Add Depot under ${modal.parent}`
      : modal?.mode === "edit"
      ? `Edit ${modal.item?.type === "MAJOR" ? "Major Section" : modal.item?.type === "BLOCK" ? "Block Section" : "Depot"}`
      : "";

  return (
    <div className="min-h-screen w-full bg-[#fffbe9]">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="w-full border-b border-black bg-yellow-200 flex items-center justify-center relative py-3 px-4">
        <Link
          href="/manage/request-table"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-blue-700 underline"
        >
          ← Back
        </Link>
        <span className="text-xl font-bold text-black">Manage Master Data</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 bg-white">
        <button
          onClick={() => setActiveTab("sections")}
          className={`px-6 py-3 text-sm font-bold transition border-b-2 ${
            activeTab === "sections"
              ? "border-yellow-500 text-yellow-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📋 Sections & Depots
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`px-6 py-3 text-sm font-bold transition border-b-2 relative ${
            activeTab === "log"
              ? "border-yellow-500 text-yellow-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🕑 Change Log
          {log.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
              {log.length}
            </span>
          )}
        </button>
      </div>

      {/* ── SECTIONS TAB ── */}
      {activeTab === "sections" && (
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `${majorSections.length} major section${majorSections.length !== 1 ? "s" : ""}`}
                {!loading && (
                  <span className="ml-2 text-gray-400">
                    · {allSections.filter((s) => s.type === "BLOCK").length} block sections
                    · {allSections.filter((s) => s.type === "DEPOT").length} depots
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={openAddMajor}
              className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition shadow-sm"
            >
              + Add Major Section
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading master data...</p>
            </div>
          ) : majorSections.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🗂️</p>
              <p className="font-semibold">No major sections yet.</p>
              <p className="text-sm mt-1">Click "+ Add Major Section" to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {majorSections.map((maj) => {
                const isOpen = expanded.has(maj.code);
                const blocks = blocksFor(maj.code);
                const depots = depotsFor(maj.code);
                const deptGroups = DEPTS.map((d) => ({
                  dept: d,
                  items: depots.filter((dep) => dep.dept === d),
                })).filter((g) => g.items.length > 0);

                return (
                  <div
                    key={maj.id}
                    className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Major section header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-yellow-100 border-b border-yellow-300 cursor-pointer select-none"
                      onClick={() => toggleExpand(maj.code)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isOpen ? "▾" : "▸"}</span>
                        <div>
                          <span className="font-extrabold text-gray-900 text-base tracking-wide">
                            {maj.code}
                          </span>
                          {maj.label && maj.label !== maj.code && (
                            <span className="ml-2 text-sm text-gray-500">{maj.label}</span>
                          )}
                        </div>
                        <span className="text-xs bg-yellow-300 text-yellow-900 border border-yellow-400 rounded-full px-2 py-0.5 font-semibold">
                          MAJOR
                        </span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-gray-400 mr-1">
                          {blocks.length}B · {depots.length}D
                        </span>
                        <button
                          onClick={() => openEdit(maj)}
                          className="text-xs bg-white border border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 px-2.5 py-1 rounded-md transition font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(maj)}
                          className="text-xs bg-white border border-red-200 text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-md transition font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="p-4 flex flex-col gap-5">
                        {/* Block Sections */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Block Sections
                            </h3>
                            <button
                              onClick={() => openAddBlock(maj.code)}
                              className="text-xs bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-black transition font-semibold"
                            >
                              + Add Block
                            </button>
                          </div>
                          {blocks.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2">
                              No block sections yet.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {blocks.map((blk) => (
                                <div
                                  key={blk.id}
                                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 group"
                                >
                                  <span className="font-mono text-sm font-semibold text-gray-800">
                                    {blk.code}
                                  </span>
                                  {blk.label && blk.label !== blk.code && (
                                    <span className="text-xs text-gray-400">{blk.label}</span>
                                  )}
                                  <div className="hidden group-hover:flex items-center gap-1 ml-1">
                                    <button
                                      onClick={() => openEdit(blk)}
                                      className="text-blue-500 hover:text-blue-700 text-xs"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(blk)}
                                      className="text-red-400 hover:text-red-600 text-xs"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Depots by Department */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Depots / Yards
                            </h3>
                            <button
                              onClick={() => openAddDepot(maj.code)}
                              className="text-xs bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-black transition font-semibold"
                            >
                              + Add Depot
                            </button>
                          </div>
                          {depots.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-2">
                              No depots yet.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {deptGroups.map(({ dept, items }) => (
                                <div key={dept}>
                                  <span
                                    className={`inline-block text-xs font-bold border rounded-full px-2.5 py-0.5 mb-1.5 ${DEPT_COLORS[dept] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}
                                  >
                                    {dept}
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {items.map((dep) => (
                                      <div
                                        key={dep.id}
                                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 group"
                                      >
                                        <span className="font-mono text-sm font-semibold text-gray-800">
                                          {dep.code}
                                        </span>
                                        {dep.label && dep.label !== dep.code && (
                                          <span className="text-xs text-gray-400">{dep.label}</span>
                                        )}
                                        <div className="hidden group-hover:flex items-center gap-1 ml-1">
                                          <button
                                            onClick={() => openEdit(dep)}
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                            title="Edit"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            onClick={() => handleDelete(dep)}
                                            className="text-red-400 hover:text-red-600 text-xs"
                                            title="Delete"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Note about roads/lines */}
          {!loading && (
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <strong>Note:</strong> Roads and Lines within yards are not yet in the database schema.
              This requires the senior developer to add a new section type. Please raise this separately.
            </div>
          )}
        </div>
      )}

      {/* ── CHANGE LOG TAB ── */}
      {activeTab === "log" && (
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">Change Log</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Session-level log — changes made in this login session.
              </p>
            </div>
            {log.length > 0 && (
              <button
                onClick={() => setLog([])}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Clear log
              </button>
            )}
          </div>

          {log.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">No changes yet this session.</p>
              <p className="text-sm mt-1">Add, edit, or delete entries to see the log here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {log.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
                >
                  <span className="text-xl mt-0.5">
                    {entry.action === "ADD" ? "✅" : entry.action === "EDIT" ? "✏️" : "🗑️"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold rounded-full px-2 py-0.5 border ${
                          entry.action === "ADD"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : entry.action === "EDIT"
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-red-100 text-red-700 border-red-300"
                        }`}
                      >
                        {entry.action}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-2 py-0.5">
                        {entry.type}
                      </span>
                      <span className="font-mono font-bold text-sm text-gray-800">
                        {entry.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{entry.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-gray-700">{entry.user}</p>
                    <p className="text-xs text-gray-400">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <strong>For Senior Developer:</strong> Persistent audit log across sessions requires a new
            <code className="mx-1 font-mono bg-blue-100 px-1 rounded">AuditLog</code>
            database model. Please raise this as a feature request.
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-4">{modalTitle}</h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder={
                    modal.mode === "add-major"
                      ? "e.g. MAS-GDR"
                      : modal.mode === "add-block"
                      ? "e.g. MAS-BBQ"
                      : "e.g. BBQ"
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Label / Display Name
                </label>
                <input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="Leave blank to use code"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {(modal.mode === "add-depot" ||
                (modal.mode === "edit" && modal.item?.type === "DEPOT")) && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    {DEPTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-black font-extrabold py-2.5 rounded-lg text-sm transition disabled:opacity-60"
              >
                {saving ? "Saving..." : modal.mode === "edit" ? "Save Changes" : "Add"}
              </button>
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
