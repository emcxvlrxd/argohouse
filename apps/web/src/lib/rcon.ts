import { Rcon } from "rcon-client";

export interface RconResponse {
  success: boolean;
  output: string;
  error?: string;
}

export async function sendRconCommand(command: string): Promise<RconResponse> {
  const host = process.env.SERVER_IP;
  const port = parseInt(process.env.RCON_PORT || "27015");
  const password = process.env.RCON_PASSWORD;

  if (!host || !password) {
    return { success: false, output: "", error: "RCON not configured" };
  }

  try {
    const connection = await Rcon.connect({
      host,
      port,
      password,
      timeout: 5000,
    });
    const response = await connection.send(command);
    await connection.end();
    return { success: true, output: response };
  } catch (error: any) {
    return {
      success: false,
      output: "",
      error: error.message || "RCON connection failed",
    };
  }
}

export const COMMANDS = {
  KICK: (name: string, reason: string) => `kick "${name}" ${reason}`,
  BAN: (name: string, duration: string, reason: string) =>
    `ban "${name}" ${duration} ${reason}`,
  UNBAN: (name: string) => `unban "${name}"`,
  MESSAGE: (message: string) => `say ${message}`,
  MAP: (map: string) => `map ${map}`,
  EXEC: (cfg: string) => `exec ${cfg}.cfg`,
  STATUS: "status",
  PLAYERS: "listplayers",
  SV_CHEATS: (v: number) => `sv_cheats ${v}`,
  RESTART: "mp_restartgame_round 1",
} as const;
