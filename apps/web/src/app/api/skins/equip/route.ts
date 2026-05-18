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

        const fixedPaint =
          parseInt(
            String(paintId)
              .replace(/,/g, "")
              .trim()
          ) || 0;

        const fixedSeed =
          parseInt(
            String(seed)
              .replace(/,/g, "")
              .trim()
          ) || 0;

        const fixedTeam =
          parseInt(
            String(team)
              .replace(/,/g, "")
              .trim()
          ) || 2;

        const fixedWear =
          parseFloat(
            String(wear)
              .replace(/,/g, ".")
              .trim()
          ) || 0.000001;

        const fixedWeapon =
          String(weapon || "")
            .trim();

        await prisma.$executeRawUnsafe(`
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
            '${steamid}',
            '${fixedWeapon}',
            ${fixedTeam},
            ${fixedPaint},
            ${fixedWear},
            ${fixedSeed},
            0
          )
          ON DUPLICATE KEY UPDATE
            paint = VALUES(paint),
            wear = VALUES(wear),
            seed = VALUES(seed)
        `);

        break;
      }

      // =====================================
      // KNIFE
      // =====================================

      case "knife": {

        const {
          knife,
          paintId,
          wear,
          seed,
          team
        } = data;

        const fixedKnife =
          String(knife || "weapon_knife")
            .trim();

        const fixedPaint =
          parseInt(
            String(paintId)
              .replace(/,/g, "")
              .trim()
          ) || 0;

        const fixedSeed =
          parseInt(
            String(seed)
              .replace(/,/g, "")
              .trim()
          ) || 0;

        const fixedTeam =
          parseInt(
            String(team)
              .replace(/,/g, "")
              .trim()
          ) || 2;

        const fixedWear =
          parseFloat(
            String(wear)
              .replace(/,/g, ".")
              .trim()
          ) || 0.000001;

        await prisma.$executeRawUnsafe(`
          INSERT INTO wp_player_knife
          (
            steamid,
            knife,
            weapon_team,
            paint,
            wear,
            seed,
            stattrak
          )
          VALUES
          (
            '${steamid}',
            '${fixedKnife}',
            ${fixedTeam},
            ${fixedPaint},
            ${fixedWear},
            ${fixedSeed},
            0
          )
          ON DUPLICATE KEY UPDATE
            knife = VALUES(knife),
            paint = VALUES(paint),
            wear = VALUES(wear),
            seed = VALUES(seed)
        `);

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

        const fixedDefindex =
          parseInt(
            String(defindex)
              .replace(/,/g, "")
              .trim()
          ) || 5030;

        const fixedTeam =
          parseInt(
            String(team)
              .replace(/,/g, "")
              .trim()
          ) || 2;

        await prisma.$executeRawUnsafe(`
          INSERT INTO wp_player_gloves
          (
            steamid,
            weapon_defindex,
            weapon_team
          )
          VALUES
          (
            '${steamid}',
            ${fixedDefindex},
            ${fixedTeam}
          )
          ON DUPLICATE KEY UPDATE
            weapon_defindex = VALUES(weapon_defindex)
        `);

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