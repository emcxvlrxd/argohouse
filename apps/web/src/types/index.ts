export interface User {
  id: string;
  steamid: string;
  steamid64: string | null;
  username: string | null;
  avatar: string | null;
  avatarfull: string | null;
  role: string;
  isBanned: boolean;
  banReason: string | null;
  banExpires: string | null;
  created_at: string;
  last_login: string;
}

export interface ServerStatus {
  online: boolean;
  name?: string;
  map?: string;
  maxplayers?: number;
  players?: number;
  ping?: number;
  tickrate?: number;
  raw?: any;
}

export interface PlayerInfo {
  name: string;
  score: number;
  time: number;
}

export interface SkinItem {
  id?: number;
  paint_id: number;
  paint_name: string;
  weapon_name: string;
  weapon_defindex: number;
  rarity: string;
  image?: string;
  cdnImage?: string;
}

export interface WeaponCategory {
  name: string;
  display: string;
  defindex: number;
  icon?: string;
}

export interface WeeklyStat {
  kills: number;
  deaths: number;
  playtime: number;
  wins: number;
  losses: number;
  kd: number;
}

export interface AdminLogEntry {
  id: number;
  steamid: string;
  username?: string;
  action: string;
  target?: string;
  details?: string;
  created_at: string;
}

export interface PlayerEquipment {
  skins: any[];
  knife: any[];
  gloves: any[];
  agents: any;
  music: any[];
}
