import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ip = process.env.SERVER_IP;
    const port = process.env.SERVER_PORT;

    if (!ip || !port) {
      return NextResponse.json({ online: false, error: "Server not configured" });
    }

    // Use Steam API to query server
    const steamKey = process.env.STEAM_API_KEY;
    if (!steamKey) {
      return NextResponse.json({ online: false, error: "Steam API key not configured" });
    }

    const res = await fetch(
      `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${steamKey}&filter=addr\\${ip}:${port}`,
      { next: { revalidate: 30 } }
    );

    const data = await res.json();
    const server = data.response?.servers?.[0];

    if (!server) {
      return NextResponse.json({ online: false });
    }

    return NextResponse.json({
      online: true,
      name: server.name || "FENA CS2",
      map: server.map || "Unknown",
      maxplayers: server.maxPlayers || 0,
      players: server.players || 0,
      ping: Math.round(server.ping || 0),
      tickrate: 128,
      raw: server,
    });
  } catch (error) {
    return NextResponse.json({ online: false, error: "Query failed" });
  }
}
