import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { sendRconCommand } from "@/lib/rcon";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { command } = await req.json();
    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Command required" }, { status: 400 });
    }

    const result = await sendRconCommand(command);
    const steamid = (session.user as any).steamid;

    // Log the command
    await prisma.adminLog.create({
      data: {
        steamid,
        action: `RCON Command: ${command}`,
        details: result.success ? result.output.substring(0, 500) : result.error,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to execute RCON command" },
      { status: 500 }
    );
  }
}
