import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    switch (type) {

      // =====================================
      // WEAPON SKINS
      // =====================================

      case "skin": {

        const {
          weapon,
          paintId,
          wear,
          seed,
          team
        } = data;

        await prisma.$executeRaw`
          INSERT INTO wp_player_skins
          (
            steamid,
            weapon,
            weapon_team,
            paint,
            wear,
            seed,
            stattrak
          )
          VALUES
          (
            ${steamid},
            ${weapon},
            ${Number(team) || 2},
            ${Number(paintId)},
            ${Number(wear) || 0.000001},
            ${Number(seed) || 0},
            0
          )
          ON DUPLICATE KEY UPDATE
            paint = VALUES(paint),
            wear = VALUES(wear),
            seed = VALUES(seed)
        `;

        break;

      }

      // =====================================
      // KNIFE
      // =====================================

      case "knife": {

        const {
          knife,
          team
        } = data;

        await prisma.$executeRaw`
          INSERT INTO wp_player_knife
          (
            steamid,
            knife,
            weapon_team
          )
          VALUES
          (
            ${steamid},
            ${Number(knife) || 500},
            ${Number(team) || 2}
          )
          ON DUPLICATE KEY UPDATE
            knife = VALUES(knife)
        `;

        break;

      }

      // =====================================
      // GLOVES
      // =====================================

      case "gloves": {

        const {
          defindex,
          team
        } = data;

        await prisma.$executeRaw`
          INSERT INTO wp_player_gloves
          (
            steamid,
            weapon_defindex,
            weapon_team
          )
          VALUES
          (
            ${steamid},
            ${Number(defindex)},
            ${Number(team) || 2}
          )
          ON DUPLICATE KEY UPDATE
            weapon_defindex = VALUES(weapon_defindex)
        `;

        break;

      }

      // =====================================
      // MUSIC KIT
      // =====================================

      case "music": {

        const {
          musicId,
          team
        } = data;

        await prisma.$executeRaw`
          INSERT INTO wp_player_music
          (
            steamid,
            music_id,
            weapon_team
          )
          VALUES
          (
            ${steamid},
            ${Number(musicId)},
            ${Number(team) || 2}
          )
          ON DUPLICATE KEY UPDATE
            music_id = VALUES(music_id)
        `;

        break;

      }

      // =====================================
      // PINS
      // =====================================

      case "pin": {

        const {
          pin,
          team
        } = data;

        await prisma.$executeRaw`
          INSERT INTO wp_player_pins
          (
            steamid,
            pin,
            weapon_team
          )
          VALUES
          (
            ${steamid},
            ${Number(pin)},
            ${Number(team) || 2}
          )
          ON DUPLICATE KEY UPDATE
            pin = VALUES(pin)
        `;

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

      message: `${type} equipped successfully`,

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to equip item",
      },
      { status: 500 }
    );

  }

}