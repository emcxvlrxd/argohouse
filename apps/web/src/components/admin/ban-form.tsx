"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, AlertTriangle } from "lucide-react";

interface BanFormProps {
  onBanCreated?: () => void;
}

export function BanForm({ onBanCreated }: BanFormProps) {
  const [steamid, setSteamid] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("0");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamid, reason, duration: parseInt(duration) }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setSteamid("");
        setReason("");
        onBanCreated?.();
      }
    } catch {
      setResult({ success: false, message: "Failed to create ban" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard glow="none">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Ban className="w-4 h-4 text-red-400" />
        Create Ban
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            SteamID
          </label>
          <Input
            placeholder="STEAM_0:0:12345678"
            value={steamid}
            onChange={(e) => setSteamid(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Duration
          </label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Permanent</SelectItem>
              <SelectItem value="1">1 Hour</SelectItem>
              <SelectItem value="24">24 Hours</SelectItem>
              <SelectItem value="168">7 Days</SelectItem>
              <SelectItem value="720">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Reason
          </label>
          <Input
            placeholder="Cheating / Toxic behavior..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            "Processing..."
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Ban Player
            </>
          )}
        </Button>
        {result && (
          <p
            className={`text-sm ${
              result.success ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.message}
          </p>
        )}
      </form>
    </GlassCard>
  );
}
