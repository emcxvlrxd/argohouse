export interface SteamProfile {
  steamid: string;
  steamid64: string;
  username: string;
  avatar: string;
  avatarfull: string;
}

export function getSteamProfileUrl(steamId64: string) {
  return `https://steamcommunity.com/profiles/${steamId64}`;
}
