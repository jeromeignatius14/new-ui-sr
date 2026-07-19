"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import axiosInstance from "@/app/utils/axiosInstance";

type SectionType = "MAJOR" | "BLOCK" | "DEPOT" | "LINE" | "ROAD";

interface MasterSection {
  id: string;
  type: SectionType;
  code: string;
  label: string | null;
  parent: string | null;
  dept: string | null;
  sort: number;
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
  const [expandedMajor, setExpandedMajor] = useState<Set<string>>(new Set());
  const [expandedBlock, setExpandedBlock] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"sections" | "log">("sections");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    type: SectionType;
    parent?: string;
    dept?: string;
    item?: MasterSection;
  } | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formDept, setFormDept] = useState("ENGG");
  const [saving, setSaving] = useState(false);

  const userName = (session?.user as any)?.name || (session?.user as any)?.email || "Unknown User";

  function pushLog(action: "ADD" | "EDIT" | "DELETE", type: SectionType, code: string, detail: string) {
    setLog((prev) => [{ action, type, code, detail, user: userName, time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) }, ...prev]);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [maj, blk, dep, lin, rod] = await Promise.all([
        axiosInstance.get("/api/master?type=MAJOR"),
        axiosInstance.get("/api/master?type=BLOCK"),
        axiosInstance.get("/api/master?type=DEPOT"),
        axiosInstance.get("/api/master?type=LINE"),
        axiosInstance.get("/api/master?type=ROAD"),
      ]);
      setAllSections([
        ...(maj.data.data ?? []),
        ...(blk.data.data ?? []),
        ...(dep.data.data ?? []),
        ...(lin.data.data ?? []),
        ...(rod.data.data ?? []),
      ]);
    } catch {
      toast.error("Failed to load master data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const majors = allSections.filter((s) => s.type === "MAJOR").sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));
  const blocksFor = (majorCode: string) => allSections.filter((s) => s.type === "BLOCK" && s.parent === majorCode).sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));
  const depotsFor = (majorCode: string) => allSections.filter((s) => s.type === "DEPOT" && s.parent === majorCode).sort((a, b) => (a.dept ?? "").localeCompare(b.dept ?? "") || a.code.localeCompare(b.code));
  const linesFor = (blockCode: string) => allSections.filter((s) => s.type === "LINE" && s.dept === blockCode).sort((a, b) => a.sort - b.sort);
  const roadsFor = (yardCode: string) => allSections.filter((s) => s.type === "ROAD" && s.dept === yardCode).sort((a, b) => a.sort - b.sort);

  function openAdd(type: SectionType, parent?: string, dept?: string) {
    setFormCode(""); setFormDept(dept ?? "ENGG");
    setModal({ mode: "add", type, parent, dept });
  }
  function openEdit(item: MasterSection) {
    setFormCode(item.code); setFormDept(item.dept ?? "ENGG");
    setModal({ mode: "edit", type: item.type, item });
  }

  async function handleSave() {
    const code = formCode.trim();
    if (!code) return toast.error("Code is required");
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.mode === "edit" && modal.item) {
        const payload: any = { code: code.toUpperCase(), label: code.toUpperCase() };
        if (modal.item.type === "DEPOT") payload.dept = formDept;
        const res = await axiosInstance.put(`/api/master/${modal.item.id}`, payload);
        if (res.data.status) {
          toast.success("Updated");
          pushLog("EDIT", modal.item.type, code.toUpperCase(), `Edited: ${modal.item.code} → ${code.toUpperCase()}`);
          setModal(null); fetchAll();
        } else toast.error(res.data.message || "Failed");
      } else {
        const payload: any = { type: modal.type, code: code.toUpperCase(), label: code.toUpperCase() };
        if (modal.parent) payload.parent = modal.parent;
        if (modal.type === "DEPOT") payload.dept = formDept;
        if (modal.type === "LINE" || modal.type === "ROAD") payload.dept = modal.dept;
        const res = await axiosInstance.post("/api/master", payload);
        if (res.data.status) {
          toast.success("Added");
          pushLog("ADD", modal.type, code.toUpperCase(), `Added under ${modal.dept ?? modal.parent ?? "root"}`);
          setModal(null); fetchAll();
        } else toast.error(res.data.message || "Failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Network error");
    } finally { setSaving(false); }
  }

  async function handleDelete(item: MasterSection) {
    const kindMap: Record<SectionType, string> = { MAJOR: "major section", BLOCK: "block section", DEPOT: "depot", LINE: "line", ROAD: "road" };
    if (!confirm(`Delete ${kindMap[item.type]} "${item.code}"? This cannot be undone.`)) return;
    try {
      const res = await axiosInstance.delete(`/api/master/${item.id}`);
      if (res.data.status) {
        toast.success(`Deleted: ${item.code}`);
        pushLog("DELETE", item.type, item.code, `Deleted`);
        fetchAll();
      } else toast.error(res.data.message || "Failed");
    } catch { toast.error("Network error"); }
  }

  function Btns({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) {
    return (
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} className="text-xs bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded px-2.5 py-1 font-semibold transition">Edit</button>
        <button onClick={onDel} className="text-xs bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded px-2.5 py-1 font-semibold transition">Delete</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fffbe9]">
      <Toaster position="top-center" />

      <div className="w-full border-b border-black bg-yellow-200 flex items-center justify-center relative py-3 px-4">
        <Link href="/manage/request-table" className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-blue-700 underline">← Back</Link>
        <span className="text-xl font-bold text-black">Manage Master Data</span>
      </div>

      <div className="flex border-b border-gray-300 bg-white">
        <button onClick={() => setActiveTab("sections")}
          className={`px-6 py-3 text-sm font-bold transition border-b-2 ${activeTab === "sections" ? "border-yellow-500 text-yellow-700" : "border-transparent text-gray-500"}`}>
          📋 Sections & Depots
        </button>
        <button onClick={() => setActiveTab("log")}
          className={`px-6 py-3 text-sm font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === "log" ? "border-yellow-500 text-yellow-700" : "border-transparent text-gray-500"}`}>
          🕑 Change Log
          {log.length > 0 && <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 text-white rounded-full">{log.length}</span>}
        </button>
      </div>

      {activeTab === "sections" && (
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              {loading ? "Loading..." : `${majors.length} major · ${allSections.filter(s=>s.type==="BLOCK").length} blocks · ${allSections.filter(s=>s.type==="DEPOT").length} depots · ${allSections.filter(s=>s.type==="LINE").length} lines · ${allSections.filter(s=>s.type==="ROAD").length} roads`}
            </p>
            <button onClick={() => openAdd("MAJOR")}
              className="bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-sm transition shadow-sm">
              + Add Major Section
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          ) : majors.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">🗂️</p><p>No major sections yet.</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {majors.map((maj) => {
                const isOpen = expandedMajor.has(maj.code);
                const blocks = blocksFor(maj.code);
                const depots = depotsFor(maj.code);
                return (
                  <div key={maj.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Major header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-yellow-100 border-b border-yellow-200 cursor-pointer select-none"
                      onClick={() => setExpandedMajor((p) => { const n = new Set(p); n.has(maj.code) ? n.delete(maj.code) : n.add(maj.code); return n; })}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{isOpen ? "▾" : "▸"}</span>
                        <span className="font-extrabold text-gray-900 text-base">{maj.code}</span>
                        {maj.label && maj.label !== maj.code && <span className="text-sm text-gray-500">{maj.label}</span>}
                        <span className="text-xs bg-yellow-300 text-yellow-900 border border-yellow-400 rounded-full px-2 py-0.5 font-bold">MAJOR</span>
                        <span className="text-xs text-gray-400">{blocks.length}B · {depots.length}D</span>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Btns onEdit={() => openEdit(maj)} onDel={() => handleDelete(maj)} />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="p-4 flex flex-col gap-5">

                        {/* BLOCK SECTIONS */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Block Sections</span>
                            <button onClick={() => openAdd("BLOCK", maj.code)}
                              className="text-xs bg-gray-800 text-white px-3 py-1 rounded font-semibold hover:bg-black transition">
                              + Add Block Section
                            </button>
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  <th className="px-3 py-2 border-b border-gray-200">Code</th>
                                  <th className="px-3 py-2 border-b border-gray-200">Label</th>
                                  <th className="px-3 py-2 border-b border-gray-200 text-center">Lines/Roads</th>
                                  <th className="px-3 py-2 border-b border-gray-200">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {blocks.length === 0 && (
                                  <tr><td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-400 italic">No block sections yet.</td></tr>
                                )}
                                {blocks.map((blk) => {
                                  const isYard = blk.code.includes("-YD");
                                  const subItems = isYard ? roadsFor(blk.code) : linesFor(blk.code);
                                  const blkOpen = expandedBlock.has(blk.id);
                                  return (
                                    <>
                                      <tr key={blk.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="px-3 py-2.5">
                                          <button onClick={() => setExpandedBlock((p) => { const n = new Set(p); n.has(blk.id) ? n.delete(blk.id) : n.add(blk.id); return n; })}
                                            className="flex items-center gap-1.5 font-mono font-semibold text-gray-800 hover:text-blue-700 text-left">
                                            <span className="text-xs text-gray-400">{blkOpen ? "▾" : "▸"}</span>
                                            {blk.code}
                                            {isYard && <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 rounded px-1.5 py-0.5">YARD</span>}
                                          </button>
                                        </td>
                                        <td className="px-3 py-2.5 text-xs text-gray-400">{blk.label && blk.label !== blk.code ? blk.label : "—"}</td>
                                        <td className="px-3 py-2.5 text-center text-xs text-gray-400">{subItems.length} {isYard ? "road" : "line"}{subItems.length !== 1 ? "s" : ""}</td>
                                        <td className="px-3 py-2.5"><Btns onEdit={() => openEdit(blk)} onDel={() => handleDelete(blk)} /></td>
                                      </tr>
                                      {blkOpen && (
                                        <tr key={blk.id + "-sub"} className="bg-slate-50">
                                          <td colSpan={4} className="px-8 py-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isYard ? "Roads" : "Lines"}</span>
                                              <button onClick={() => openAdd(isYard ? "ROAD" : "LINE", maj.code, blk.code)}
                                                className="text-xs bg-gray-700 text-white px-2.5 py-1 rounded font-semibold hover:bg-black transition">
                                                + Add {isYard ? "Road" : "Line"}
                                              </button>
                                            </div>
                                            <table className="w-full text-xs border-collapse">
                                              <thead>
                                                <tr className="text-left text-gray-400 font-bold uppercase tracking-wider">
                                                  <th className="px-2 py-1.5 border-b border-gray-200 w-8">#</th>
                                                  <th className="px-2 py-1.5 border-b border-gray-200">Name</th>
                                                  <th className="px-2 py-1.5 border-b border-gray-200">Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {subItems.length === 0 ? (
                                                  <tr><td colSpan={3} className="px-2 py-3 text-center text-gray-400 italic">None yet. Add one above.</td></tr>
                                                ) : subItems.map((si, idx) => (
                                                  <tr key={si.id} className="border-t border-gray-100 hover:bg-white">
                                                    <td className="px-2 py-2 text-gray-400">{idx + 1}</td>
                                                    <td className="px-2 py-2 font-medium text-gray-800">{si.code}</td>
                                                    <td className="px-2 py-2"><Btns onEdit={() => openEdit(si)} onDel={() => handleDelete(si)} /></td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* DEPOTS */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Depots</span>
                            <button onClick={() => openAdd("DEPOT", maj.code)}
                              className="text-xs bg-gray-800 text-white px-3 py-1 rounded font-semibold hover:bg-black transition">
                              + Add Depot
                            </button>
                          </div>
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  <th className="px-3 py-2 border-b border-gray-200">Code</th>
                                  <th className="px-3 py-2 border-b border-gray-200">Label</th>
                                  <th className="px-3 py-2 border-b border-gray-200">Dept</th>
                                  <th className="px-3 py-2 border-b border-gray-200">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {depots.length === 0 && (
                                  <tr><td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-400 italic">No depots yet.</td></tr>
                                )}
                                {depots.map((dep) => (
                                  <tr key={dep.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-2.5 font-mono font-semibold text-gray-800">{dep.code}</td>
                                    <td className="px-3 py-2.5 text-xs text-gray-400">{dep.label && dep.label !== dep.code ? dep.label : "—"}</td>
                                    <td className="px-3 py-2.5">
                                      <span className={`text-xs font-bold border rounded-full px-2 py-0.5 ${DEPT_COLORS[dep.dept ?? ""] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                        {dep.dept ?? "—"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5"><Btns onEdit={() => openEdit(dep)} onDel={() => handleDelete(dep)} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "log" && (
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800">Change Log</h2>
              <p className="text-xs text-gray-500 mt-0.5">Session-level — resets on next login. Persistent log needs Senior Developer.</p>
            </div>
            {log.length > 0 && <button onClick={() => setLog([])} className="text-xs text-red-500 hover:text-red-700 underline">Clear</button>}
          </div>
          {log.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-semibold">No changes this session.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 border-b border-gray-200">Time</th>
                    <th className="px-4 py-3 border-b border-gray-200">Action</th>
                    <th className="px-4 py-3 border-b border-gray-200">Type</th>
                    <th className="px-4 py-3 border-b border-gray-200">Code</th>
                    <th className="px-4 py-3 border-b border-gray-200">Detail</th>
                    <th className="px-4 py-3 border-b border-gray-200">By</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((entry, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap">{entry.time}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold rounded-full px-2 py-0.5 border ${entry.action === "ADD" ? "bg-green-100 text-green-700 border-green-300" : entry.action === "EDIT" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{entry.type}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-gray-800">{entry.code}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{entry.detail}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-gray-600">{entry.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">
              {modal.mode === "edit" ? `Edit ${modal.item?.type}` : `Add ${modal.type}${modal.dept ? ` under ${modal.dept}` : modal.parent ? ` under ${modal.parent}` : ""}`}
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Code <span className="text-red-500">*</span></label>
                <input value={formCode} onChange={(e) => setFormCode(e.target.value)}
                  placeholder={modal.type === "LINE" ? "e.g. UP line" : modal.type === "ROAD" ? "e.g. Rd 1" : modal.type === "DEPOT" ? "e.g. BBQ" : "e.g. MAS-BBQ"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400" autoFocus />
              </div>
              {(modal.type === "DEPOT" || (modal.mode === "edit" && modal.item?.type === "DEPOT")) && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
                  <select value={formDept} onChange={(e) => setFormDept(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 border border-yellow-600 text-black font-extrabold py-2.5 rounded-lg text-sm transition disabled:opacity-60">
                {saving ? "Saving..." : modal.mode === "edit" ? "Save Changes" : "Add"}
              </button>
              <button onClick={() => setModal(null)} disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
