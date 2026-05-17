export interface SteamProfile {
  steamid: string;
  steamid64: string;
  username: string;
  avatar: string;
  avatarfull: string;
}

export function parseSteamId(steamId64: string) {
  const id = BigInt(steamId64);
  const universe = Number(id >> 56n);
  const accountType = Number((id >> 52n) & 0xfn);
  const instance = Number((id >> 32n) & 0xfffffn);
  const accountNumber = Number(id & 0xffffffffn);

  const authServer = accountNumber & 1;
  const accountId = (accountNumber - authServer) / 2;

  return {
    steamId64,
    steamId: `STEAM_0:${authServer}:${accountId}`,
    universe,
    accountType,
    instance,
    accountNumber,
  };
}

export function getSteamProfileUrl(steamId64: string) {
  return `https://steamcommunity.com/profiles/${steamId64}`;
}

export function getSteamAvatarUrl(steamId64: string, size: "small" | "medium" | "full" = "medium") {
  return `https://avatars.steamstatic.com/${steamId64}_${size === "small" ? "32" : size === "medium" ? "64" : "full"}.jpg`;
}
