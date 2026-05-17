"use client";

import { useState, useEffect } from "react";
import { ServerStatus } from "@/types";

export function useServerStatus(refreshInterval = 30000) {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/server");
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({ online: false });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { status, loading };
}
