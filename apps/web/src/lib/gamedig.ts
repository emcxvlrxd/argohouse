export interface ServerStatus {
  name: string;
  map: string;
  password: boolean;
  maxplayers: number;
  players: PlayerInfo[];
  bots: any[];
  ping: number;
  raw: {
    protocol?: number;
    folder?: string;
    game?: string;
    appId?: number;
    steamId?: string;
    version?: string;
    tickrate?: number;
  };
}

export interface PlayerInfo {
  name: string;
  raw: {
    score: number;
    time: number;
  };
}

const GAME_DIG_API = "https://api.gamedig.net/v1/query";

export async function queryServer(ip: string, port: number): Promise<ServerStatus | null> {
  try {
    const res = await fetch(
      `${GAME_DIG_API}?type=css&host=${ip}&port=${port}&timeout=5000`
    );
    const data = await res.json();
    if (data.error) return null;
    return data as ServerStatus;
  } catch {
    return null;
  }
}

export function formatPlaytime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${m}m`;
}
