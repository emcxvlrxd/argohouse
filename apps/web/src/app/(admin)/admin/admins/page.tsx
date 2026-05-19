"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n";
import { UserCog, Plus, Trash2, Search, X, Check, Sliders } from "lucide-react";

const flagGroups = [
  {
    label: "Root",
    flags: [
      { key: "root", icon: "◈", label: "Root" },
    ],
  },
  {
    label: "Ban",
    flags: [
      { key: "ban", icon: "⊘", label: "Ban" },
      { key: "unban", icon: "⊕", label: "Unban" },
    ],
  },
  {
    label: "Mute",
    flags: [
      { key: "mute", icon: "🔇", label: "Mute" },
      { key: "gag", icon: "🔒", label: "Gag" },
    ],
  },
  {
    label: "Player",
    flags: [
      { key: "kick", icon: "⊳", label: "Kick" },
      { key: "slay", icon: "⊗", label: "Slay" },
      { key: "freeze", icon: "❄", label: "Freeze" },
      { key: "noclip", icon: "🪽", label: "Noclip" },
      { key: "god", icon: "🛡", label: "God" },
      { key: "respawn", icon: "↻", label: "Respawn" },
      { key: "teleport", icon: "◎", label: "Teleport" },
      { key: "give", icon: "🎁", label: "Give" },
      { key: "health", icon: "❤", label: "Health" },
    ],
  },
  {
    label: "Server",
    flags: [
      { key: "changemap", icon: "◫", label: "Change Map" },
      { key: "workshop", icon: "🗺", label: "Workshop" },
      { key: "execconfig", icon: "⚙", label: "Exec Config" },
      { key: "cvar", icon: "⚡", label: "CVar" },
      { key: "rcon", icon: "⌘", label: "RCON" },
    ],
  },
  {
    label: "Admin",
    flags: [
      { key: "reload", icon: "⟳", label: "Reload" },
      { key: "adminlist", icon: "☰", label: "Admin List" },
      { key: "tag", icon: "🏷", label: "Tag" },
      { key: "vip", icon: "⭐", label: "VIP" },
      { key: "chat", icon: "💬", label: "Chat" },
    ],
  },
  {
    label: "Fun",
    flags: [
      { key: "beacon", icon: "🔦", label: "Beacon" },
      { key: "blind", icon: "👁", label: "Blind" },
      { key: "drug", icon: "💊", label: "Drug" },
      { key: "shake", icon: "📳", label: "Shake" },
      { key: "glow", icon: "✨", label: "Glow" },
      { key: "color", icon: "🎨", label: "Color" },
      { key: "bury", icon: "🪦", label: "Bury" },
      { key: "gravity", icon: "🌌", label: "Gravity" },
    ],
  },
];

const allFlagKeys = flagGroups.flatMap((g) => g.flags.map((f) => f.key));

const flagColors: Record<string, string> = {
  root: "from-amber-500 to-yellow-500",
  ban: "from-red-500 to-rose-600",
  unban: "from-emerald-500 to-green-600",
  kick: "from-orange-500 to-red-500",
  slay: "from-purple-500 to-violet-600",
  mute: "from-yellow-500 to-orange-600",
  gag: "from-stone-500 to-zinc-600",
  freeze: "from-cyan-400 to-blue-500",
  noclip: "from-sky-300 to-indigo-500",
  god: "from-amber-300 to-orange-500",
  respawn: "from-teal-400 to-emerald-500",
  teleport: "from-fuchsia-400 to-purple-600",
  give: "from-pink-400 to-rose-500",
  health: "from-red-400 to-pink-500",
  changemap: "from-blue-500 to-cyan-600",
  workshop: "from-lime-400 to-green-600",
  execconfig: "from-teal-500 to-emerald-600",
  cvar: "from-pink-500 to-fuchsia-600",
  rcon: "from-violet-500 to-purple-600",
  tag: "from-indigo-400 to-violet-500",
  vip: "from-amber-400 to-yellow-500",
  reload: "from-slate-400 to-gray-600",
  adminlist: "from-cyan-400 to-sky-600",
  chat: "from-sky-500 to-blue-600",
  beacon: "from-yellow-400 to-amber-600",
  blind: "from-gray-400 to-zinc-600",
  drug: "from-green-400 to-emerald-600",
  shake: "from-fuchsia-400 to-pink-600",
  glow: "from-cyan-300 to-blue-500",
  color: "from-rose-400 to-purple-500",
  bury: "from-stone-500 to-zinc-700",
  gravity: "from-indigo-400 to-violet-500",
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ steamid64: "", name: "", flags: [] as string[], immunity: 50 });

  const itemsPerPage = 10;

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?type=admins");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const lowerSearch = search.toLowerCase();
  const filtered = admins.filter((a: any) => {
    const matchSearch = (a.username || "").toLowerCase().includes(lowerSearch) || a.steamid64?.toLowerCase().includes(lowerSearch);
    const matchStatus = filterStatus === "all" || (filterStatus === "online" ? false : true); // simplified
    return matchSearch;
  });
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const openAdd = () => {
    setForm({ steamid64: "", name: "", flags: [], immunity: 50 });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (admin: any) => {
    const parsed = parseAdminFlags(admin.adminFlags);
    setForm({ steamid64: admin.steamid64 || admin.steamid, name: admin.username || "", flags: parsed.flags, immunity: parsed.immunity });
    setEditingId(admin.id);
    setShowModal(true);
  };

  const parseAdminFlags = (raw: string | null): { flags: string[]; immunity: number } => {
    if (!raw) return { flags: [], immunity: 50 };
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return { flags: parsed, immunity: 50 };
      return { flags: parsed.flags || [], immunity: parsed.immunity || 50 };
    } catch {
      return { flags: raw ? raw.split("").filter((c) => c !== " ") : [], immunity: 50 };
    }
  };

  const toggleFlag = (flagKey: string) => {
    if (flagKey === "root") {
      setForm((prev) => prev.flags.includes("root") ? { ...prev, flags: [] } : { ...prev, flags: ["root"] });
      return;
    }
    setForm((prev) => {
      if (prev.flags.includes("root")) return prev;
      return {
        ...prev,
        flags: prev.flags.includes(flagKey) ? prev.flags.filter((f) => f !== flagKey) : [...prev.flags, flagKey],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.steamid64.trim()) return;

    const flagsData = JSON.stringify({ flags: form.flags, immunity: form.immunity });

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamid64: form.steamid64.trim(), flags: flagsData }),
    });
    if (res.ok) {
      setShowModal(false);
      await fetchAdmins();
    }
  };

  const handleDelete = async (id: number) => {
    const admin = admins.find((a: any) => a.id === id);
    if (!admin) return;
    await fetch("/api/admin/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamid64: admin.steamid64 || admin.steamid }),
    });
    setAdmins((prev) => prev.filter((a: any) => a.id !== id));
    setDeleteId(null);
  };

  const renderFlags = (flags: string[]) => {
    const shown = flags.slice(0, 3);
    const remaining = flags.slice(3);
    return (
      <div className="flex flex-wrap gap-1">
        {shown.map((f) => (
          <span key={f} className={`rounded-md bg-gradient-to-r ${flagColors[f] || "from-slate-500 to-slate-600"} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white`}>
            {f}
          </span>
        ))}
        {remaining.length > 0 && (
          <div className="group relative">
            <span className="cursor-default rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              +{remaining.length}
            </span>
            <div className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 w-max rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
              <div className="flex flex-wrap gap-1.5">
                {remaining.map((f) => (
                  <span key={f} className={`rounded-md bg-gradient-to-r ${flagColors[f] || "from-slate-500 to-slate-600"} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white`}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCog className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold font-display">{t("Admins")}</h1>
            <p className="text-xs text-muted-foreground">{admins.length} yönetici</p>
          </div>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0">
          <Plus className="w-4 h-4 mr-1" /> {t("Add Admin")}
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("Search")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : paginated.length === 0 ? (
        <GlassCard glow="none">
          <p className="text-center text-muted-foreground py-8 text-sm">{t("No admins found")}</p>
        </GlassCard>
      ) : (
        <GlassCard glow="none" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-4">{t("Players")}</th>
                  <th className="px-4 py-4 hidden md:table-cell">{t("Flags")}</th>
                  <th className="px-4 py-4 hidden lg:table-cell">Immunity</th>
                  <th className="px-4 py-4 text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((admin: any, i: number) => {
                  const parsed = parseAdminFlags(admin.adminFlags);
                  return (
                    <tr key={admin.id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-cyan-500/30 flex-shrink-0">
                            {admin.avatar ? (
                              <img src={admin.avatar} alt="" className="rounded-full" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                                {(admin.username || "?").charAt(0)}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{admin.username || t("Unknown")}</div>
                            <div className="text-xs text-muted-foreground font-mono">{admin.steamid64 || admin.steamid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {renderFlags(parsed.flags)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600" style={{ width: parsed.immunity + "%" }} />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">{parsed.immunity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(admin)} title="Edit">
                            ✎
                          </Button>
                          {deleteId === admin.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-red-400">Sil?</span>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-400" onClick={() => handleDelete(admin.id)}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDeleteId(null)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={() => setDeleteId(admin.id)} title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
              <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</Button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="mx-4 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">{editingId ? "✎" : "＋"} {t("Add Admin")}</h3>
            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">SteamID64</label>
                  <Input
                    placeholder="7656119..."
                    value={form.steamid64}
                    onChange={(e) => setForm((prev) => ({ ...prev, steamid64: e.target.value }))}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {/* Immunity */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" /> Immunity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.immunity}
                    onChange={(e) => setForm((prev) => ({ ...prev, immunity: Number(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                  <span className="w-10 text-right text-sm font-bold text-white">{form.immunity}</span>
                </div>
              </div>

              {/* Flags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-muted-foreground">{t("Flags")}</label>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"
                      onClick={() => setForm((prev) => ({ ...prev, flags: [...allFlagKeys] }))}>
                      All
                    </button>
                    <button type="button" className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-bold text-slate-400 hover:bg-white/10"
                      onClick={() => setForm((prev) => ({ ...prev, flags: [] }))}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {flagGroups.map((group) => (
                    <div key={group.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {group.flags.map((flag) => {
                          const isSelected = form.flags.includes(flag.key);
                          const isRoot = flag.key === "root";
                          const disabled = form.flags.includes("root") && !isRoot;
                          return (
                            <label key={flag.key} className={`flex cursor-pointer items-center gap-1.5 transition ${disabled ? "pointer-events-none opacity-30" : ""}`}>
                              <button
                                type="button"
                                className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border transition ${isSelected ? "border-cyan-400 bg-cyan-500" : "border-slate-600 bg-slate-800"}`}
                                onClick={() => toggleFlag(flag.key)}
                              >
                                <span className={`inline-block size-2.5 rounded-full bg-white transition-transform ${isSelected ? "translate-x-3.5" : "translate-x-0.5"}`} />
                              </button>
                              <span className={`text-[11px] font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>
                                {flag.icon} {flag.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {form.flags.includes("root") && (
                  <p className="mt-2 text-xs text-amber-400">Root flag seçildiğinde diğer flagler devre dışı kalır</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white border-0">
                  {editingId ? t("Save") : t("Add")}
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} type="button">
                  {t("Cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
