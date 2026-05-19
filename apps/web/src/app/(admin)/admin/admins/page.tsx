"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { UserCog, Shield, Plus, Trash2, Terminal } from "lucide-react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [steamid64, setSteamid64] = useState("");
  const [flags, setFlags] = useState("@@");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin?type=admins");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const addAdmin = async () => {
    if (!steamid64.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid64: steamid64.trim(), flags: flags.trim() || "@@" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed");
      } else {
        setSteamid64("");
        setFlags("@@");
        await fetchAdmins();
      }
    } catch {
      setError("Connection failed");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (steamid64: string) => {
    if (!confirm("Remove this admin?")) return;
    try {
      await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid64 }),
      });
      await fetchAdmins();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserCog className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold font-display">Admins</h1>
          <p className="text-xs text-muted-foreground">CS2 server admin flags management</p>
        </div>
      </div>

      {/* Add form */}
      <GlassCard glow="none">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm">Add Admin</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="SteamID64 (7656...)"
            value={steamid64}
            onChange={(e) => setSteamid64(e.target.value)}
            className="font-mono text-xs"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Flags"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono text-xs w-24"
            />
            <Button onClick={addAdmin} disabled={!steamid64.trim() || adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        <div className="mt-2 text-[10px] text-muted-foreground">
          Flags: <code className="text-cyan-300">@</code> immunity, <code className="text-cyan-300">b</code> reservation, <code className="text-cyan-300">c</code> kick, <code className="text-cyan-300">d</code> ban, <code className="text-cyan-300">z</code> root. <code className="text-cyan-300">@@</code> = root admin.
        </div>
      </GlassCard>

      {/* Admin list */}
      <GlassCard glow="none">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No admins found</p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin: any, i: number) => (
              <motion.div
                key={admin.id || admin.steamid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Avatar className="h-10 w-10 ring-2 ring-cyan-500/30 flex-shrink-0">
                  {admin.avatar ? (
                    <img src={admin.avatar} alt="" className="rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{admin.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{admin.steamid64 || admin.steamid}</p>
                </div>
                <Badge variant={admin.role === "owner" ? "warning" : "purple"} className="text-[10px]">
                  {admin.role}
                </Badge>
                <code className="text-[11px] font-mono px-2 py-1 rounded bg-white/5 text-cyan-300">
                  {admin.adminFlags || "@@"}
                </code>
                {admin.role !== "owner" && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400" onClick={() => removeAdmin(admin.steamid64 || admin.steamid)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
