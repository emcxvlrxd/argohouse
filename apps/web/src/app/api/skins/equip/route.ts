import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const steamid = (session.user as any).steamid;
    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case "skin": {
        const { defindex, paintId, wear, seed, team } = data;
        const existing = await prisma.playerSkin.findUnique({
          where: {
            steamid_weapon_defindex_weapon_team: {
              steamid,
              weapon_defindex: defindex,
              weapon_team: team || 2,
            },
          },
        });

        if (existing) {
          await prisma.playerSkin.update({
            where: { id: existing.id },
            data: {
              weapon_paint_id: paintId,
              weapon_wear: wear || 0.000001,
              weapon_seed: seed || 0,
            },
          });
        } else {
          await prisma.playerSkin.create({
            data: {
              steamid,
              weapon_defindex: defindex,
              weapon_paint_id: paintId,
              weapon_wear: wear || 0.000001,
              weapon_seed: seed || 0,
              weapon_team: team || 2,
            },
          });
        }
        break;
      }

      case "knife": {
        const { knife, team } = data;
        for (const t of [2, 3]) {
          const existing = await prisma.playerKnife.findUnique({
            where: { steamid_weapon_team: { steamid, weapon_team: t } },
          });
          if (existing) {
            await prisma.playerKnife.update({
              where: { id: existing.id },
              data: { knife: knife || "weapon_knife" },
            });
          } else {
            await prisma.playerKnife.create({
              data: { steamid, weapon_team: t, knife: knife || "weapon_knife" },
            });
          }
        }
        break;
      }

      case "gloves": {
        const { defindex, team } = data;
        const existing = await prisma.playerGlove.findUnique({
          where: { steamid_weapon_team: { steamid, weapon_team: team || 2 } },
        });
        if (existing) {
          await prisma.playerGlove.update({
            where: { id: existing.id },
            data: { weapon_defindex: defindex },
          });
        } else {
          await prisma.playerGlove.create({
            data: { steamid, weapon_defindex: defindex, weapon_team: team || 2 },
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Log the action
    await prisma.adminLog.create({
      data: {
        steamid,
        action: `Equipped ${type}`,
        details: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, message: `${type} equipped successfully` });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to equip item" }, { status: 500 });
  }
}
