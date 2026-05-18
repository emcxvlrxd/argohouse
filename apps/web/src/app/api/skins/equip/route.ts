import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function toNum(v: any, fallback = 0): number {
  const n = parseInt(String(v ?? "").replace(/,/g, "").trim());
  return isNaN(n) ? fallback : n;
}

function toFloat(v: any, fallback = 0.000001): number {
  const n = parseFloat(String(v ?? "").replace(/,/g, ".").trim());
  return isNaN(n) ? fallback : n;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const steamid = (session.user as any).steamid;
    const body = await req.json();
    const { type, data } = body;

    // Ensure player has default rows in ALL wp_player_* tables to prevent plugin NullReferenceException
    await prisma.$executeRaw`INSERT IGNORE INTO wp_player_music (steamid, music, music_id, weapon_team) VALUES (${steamid}, '', 0, 2)`;
    await prisma.$executeRaw`INSERT IGNORE INTO wp_player_agents (steamid, agent_ct, agent_t) VALUES (${steamid}, '', '')`;
    await prisma.$executeRaw`INSERT IGNORE INTO wp_player_pins (steamid, pin, weapon_team) VALUES (${steamid}, 0, 2)`;

    switch (type) {
      case "skin": {
        const weapon = String(data?.weapon || "").trim() || "weapon_ak47";
        const paintId = toNum(data?.paintId);
        const seed = toNum(data?.seed);
        const team = toNum(data?.team, 2);
        const wear = toFloat(data?.wear);

        await prisma.$executeRaw`
          INSERT INTO wp_player_skins (steamid, weapon, weapon_team, paint, wear, seed, stattrak)
          VALUES (${steamid}, ${weapon}, ${team}, ${paintId}, ${wear}, ${seed}, 0)
          ON DUPLICATE KEY UPDATE
            paint = VALUES(paint),
            wear = VALUES(wear),
            seed = VALUES(seed)
        `;

        break;
      }

      case "knife": {
        const knife = String(data?.knife || "weapon_knife").trim();
        const paintId = toNum(data?.paintId);
        const seed = toNum(data?.seed);
        const team = toNum(data?.team, 2);
        const wear = toFloat(data?.wear);

        await prisma.$executeRaw`
          INSERT INTO wp_player_knife (steamid, knife, weapon_team, paint, wear, seed, stattrak)
          VALUES (${steamid}, ${knife}, ${team}, ${paintId}, ${wear}, ${seed}, 0)
          ON DUPLICATE KEY UPDATE
            knife = VALUES(knife),
            paint = VALUES(paint),
            wear = VALUES(wear),
            seed = VALUES(seed)
        `;

        break;
      }

      case "gloves": {
        const defindex = toNum(data?.defindex, 5030);
        const team = toNum(data?.team, 2);

        await prisma.$executeRaw`
          INSERT INTO wp_player_gloves (steamid, weapon_defindex, weapon_team)
          VALUES (${steamid}, ${defindex}, ${team})
          ON DUPLICATE KEY UPDATE
            weapon_defindex = VALUES(weapon_defindex)
        `;

        break;
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${type} equipped successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to equip item" }, { status: 500 });
  }
}
