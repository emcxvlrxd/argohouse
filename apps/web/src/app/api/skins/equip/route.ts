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

async function upsertSkin(
  steamid: string,
  weapon: string,
  defindex: number,
  paintId: number,
  wear: number,
  seed: number,
  team: number
) {
  await prisma.$executeRaw`
    INSERT INTO wp_player_skins (
      steamid,
      weapon,
      weapon_defindex,
      weapon_paint_id,
      weapon_wear,
      weapon_seed,
      weapon_team,
      paint,
      wear,
      seed,
      stattrak,
      weapon_nametag,
      weapon_stattrak,
      weapon_stattrak_count,
      weapon_keychain,
      weapon_sticker_0,
      weapon_sticker_1,
      weapon_sticker_2,
      weapon_sticker_3,
      weapon_sticker_4
    )
    VALUES (
      ${steamid},
      ${weapon},
      ${defindex},
      ${paintId},
      ${wear},
      ${seed},
      ${team},
      ${paintId},
      ${wear},
      ${seed},
      0,
      '',
      0,
      0,
      '0;0;0;0;0',
      '0;0;0;0;0;0;0',
      '0;0;0;0;0;0;0',
      '0;0;0;0;0;0;0',
      '0;0;0;0;0;0;0',
      '0;0;0;0;0;0;0'
    )
    ON DUPLICATE KEY UPDATE
      weapon_defindex = VALUES(weapon_defindex),
      weapon_paint_id = VALUES(weapon_paint_id),
      weapon_wear = VALUES(weapon_wear),
      weapon_seed = VALUES(weapon_seed),
      paint = VALUES(paint),
      wear = VALUES(wear),
      seed = VALUES(seed)
  `;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const steamid = (session.user as any).steamid;

    const body = await req.json();
    const { type, data } = body;

    const paintId = toNum(data?.paintId);
    const seed = toNum(data?.seed);
    const wear = toFloat(data?.wear);
    const defindex = toNum(data?.defindex);

    // Ensure base rows
    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_music (steamid, music_id, weapon_team)
      VALUES (${steamid}, 0, 2)
    `;

    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_music (steamid, music_id, weapon_team)
      VALUES (${steamid}, 0, 3)
    `;

    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_agents (steamid, agent_ct, agent_t)
      VALUES (${steamid}, '', '')
    `;

    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_pins (steamid, id, weapon_team)
      VALUES (${steamid}, 0, 2)
    `;

    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_pins (steamid, id, weapon_team)
      VALUES (${steamid}, 0, 3)
    `;

    switch (type) {
      // =========================
      // WEAPON SKINS
      // =========================
      case "skin": {
        const weapon =
          String(data?.weapon || "").trim() || "weapon_ak47";

        await upsertSkin(
          steamid,
          weapon,
          defindex,
          paintId,
          wear,
          seed,
          2
        );

        await upsertSkin(
          steamid,
          weapon,
          defindex,
          paintId,
          wear,
          seed,
          3
        );

        break;
      }

      // =========================
      // KNIFE
      // =========================
      case "knife": {
        const knife =
          String(data?.knife || "weapon_knife").trim();

        for (const team of [2, 3]) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_knife (
              steamid,
              knife,
              weapon_team,
              paint,
              wear,
              seed,
              stattrak
            )
            VALUES (
              ${steamid},
              ${knife},
              ${team},
              ${paintId},
              ${wear},
              ${seed},
              0
            )
            ON DUPLICATE KEY UPDATE
              knife = VALUES(knife),
              paint = VALUES(paint),
              wear = VALUES(wear),
              seed = VALUES(seed)
          `;
        }

        // IMPORTANT FOR CT/T
        await upsertSkin(
          steamid,
          knife,
          defindex,
          paintId,
          wear,
          seed,
          2
        );

        await upsertSkin(
          steamid,
          knife,
          defindex,
          paintId,
          wear,
          seed,
          3
        );

        break;
      }

      // =========================
      // GLOVES
      // =========================
      case "gloves": {
        for (const team of [2, 3]) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_gloves (
              steamid,
              gloves,
              weapon_defindex,
              weapon_team
            )
            VALUES (
              ${steamid},
              ${paintId},
              ${defindex},
              ${team}
            )
            ON DUPLICATE KEY UPDATE
              gloves = VALUES(gloves),
              weapon_defindex = VALUES(weapon_defindex)
          `;
        }

        break;
      }

      // =========================
      // AGENTS
      // =========================
      case "agent": {
        const model = String(data?.model || "").trim();
        const team = toNum(data?.team);

        if (team === 2) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_agents (
              steamid,
              agent_ct,
              agent_t
            )
            VALUES (
              ${steamid},
              '',
              ${model}
            )
            ON DUPLICATE KEY UPDATE
              agent_t = VALUES(agent_t)
          `;
        } else if (team === 3) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_agents (
              steamid,
              agent_ct,
              agent_t
            )
            VALUES (
              ${steamid},
              ${model},
              ''
            )
            ON DUPLICATE KEY UPDATE
              agent_ct = VALUES(agent_ct)
          `;
        }

        break;
      }

      // =========================
      // MUSIC
      // =========================
      case "music": {
        const musicId = toNum(data?.paintId);

        for (const team of [2, 3]) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_music (
              steamid,
              music_id,
              weapon_team
            )
            VALUES (
              ${steamid},
              ${musicId},
              ${team}
            )
            ON DUPLICATE KEY UPDATE
              music_id = VALUES(music_id)
          `;
        }

        break;
      }

      // =========================
      // PINS
      // =========================
      case "pin": {
        const pinId = toNum(data?.paintId);

        for (const team of [2, 3]) {
          await prisma.$executeRaw`
            INSERT INTO wp_player_pins (
              steamid,
              weapon_team,
              id
            )
            VALUES (
              ${steamid},
              ${team},
              ${pinId}
            )
            ON DUPLICATE KEY UPDATE
              id = VALUES(id)
          `;
        }

        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type} equipped successfully`
    });

  } catch (error) {
    console.error("EQUIP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to equip item"
      },
      { status: 500 }
    );
  }
}