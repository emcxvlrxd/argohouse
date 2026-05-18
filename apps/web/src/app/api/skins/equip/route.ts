import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function toNum(v: any, fallback = 0): number {
  const n = parseInt(
    String(v ?? "")
      .replace(/,/g, "")
      .trim(),
    10
  );

  return isNaN(n) ? fallback : n;
}

function toFloat(
  v: any,
  fallback = 0.000001
): number {

  const n = parseFloat(
    String(v ?? "")
      .replace(/,/g, ".")
      .trim()
  );

  return isNaN(n)
    ? fallback
    : n;
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

export async function POST(
  req: NextRequest
) {

  try {

    const session =
      await getServerSession(
        authOptions
      );

    if (!session?.user) {

      return NextResponse.json(
        {
          error: "Unauthorized"
        },
        {
          status: 401
        }
      );

    }

    const steamid =
      (session.user as any).steamid;

    const body =
      await req.json();

    const {
      type,
      data
    } = body;

    const paintId =
      toNum(data?.paintId);

    const seed =
      toNum(data?.seed);

    const wear =
      toFloat(data?.wear);

    const defindex =
      toNum(data?.defindex);

    // =========================
    // BASE ROWS
    // =========================

    await prisma.$executeRaw`
      INSERT IGNORE INTO wp_player_agents (
        steamid,
        agent_ct,
        agent_t
      )
      VALUES (
        ${steamid},
        '',
        ''
      )
    `;

    // =========================
    // SWITCH
    // =========================

    switch (type) {

      // =====================
      // NORMAL SKINS
      // =====================

      case "skin": {

        const weapon =
          String(
            data?.weapon ||
            "weapon_ak47"
          ).trim();

        for (const team of [2, 3]) {

          await upsertSkin(
            steamid,
            weapon,
            defindex,
            paintId,
            wear,
            seed,
            team
          );

        }

        break;
      }

      // =====================
      // KNIFE
      // =====================

      case "knife": {

        const knife =
          String(
            data?.knife ||
            "weapon_knife"
          ).trim();

        // IMPORTANT:
        // DELETE OLD ROWS FIRST

        await prisma.$executeRaw`
          DELETE FROM wp_player_knife
          WHERE steamid = ${steamid}
        `;

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
          `;

          await upsertSkin(
            steamid,
            knife,
            defindex,
            paintId,
            wear,
            seed,
            team
          );

        }

        break;
      }

      // =====================
      // GLOVES
      // =====================

      case "gloves": {

        // IMPORTANT:
        // DELETE OLD ROWS FIRST

        await prisma.$executeRaw`
          DELETE FROM wp_player_gloves
          WHERE steamid = ${steamid}
        `;

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
          `;

        }

        break;
      }

      // =====================
      // AGENTS
      // =====================

      case "agent": {

        const model =
          String(
            data?.model || ""
          ).trim();

        const team =
          toNum(data?.team);

        if (team === 2) {

          await prisma.$executeRaw`
            UPDATE wp_player_agents
            SET agent_t = ${model}
            WHERE steamid = ${steamid}
          `;

        }

        if (team === 3) {

          await prisma.$executeRaw`
            UPDATE wp_player_agents
            SET agent_ct = ${model}
            WHERE steamid = ${steamid}
          `;

        }

        break;
      }

      // =====================
      // MUSIC
      // =====================

      case "music": {

        const musicId =
          toNum(data?.paintId);

        await prisma.$executeRaw`
          DELETE FROM wp_player_music
          WHERE steamid = ${steamid}
        `;

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
          `;

        }

        break;
      }

      // =====================
      // PINS
      // =====================

      case "pin": {

        const pinId =
          toNum(data?.paintId);

        await prisma.$executeRaw`
          DELETE FROM wp_player_pins
          WHERE steamid = ${steamid}
        `;

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
          `;

        }

        break;
      }

      default:

        return NextResponse.json(
          {
            error: "Invalid type"
          },
          {
            status: 400
          }
        );

    }

    return NextResponse.json({
      success: true,
      message:
        `${type} equipped successfully`
    });

  } catch (error) {

    console.error(
      "EQUIP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to equip item"
      },
      {
        status: 500
      }
    );

  }

}