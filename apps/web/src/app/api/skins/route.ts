import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = join(process.cwd(), "data");

function loadJson(filename: string): any[] {
  const paths = [
    join(DATA_DIR, `${filename}.json`),
    join(DATA_DIR, `${filename}_tr.json`),
    join(DATA_DIR, `${filename}_en.json`),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, "utf-8"));
      } catch {
        return [];
      }
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type");
    const steamid = (session.user as any).steamid;

    switch (type) {
      case "knives": {
        const all = loadJson("skins");
        const knives = all.filter((s) => (s.weapon_defindex || 0) >= 500);
        return NextResponse.json({ skins: knives });
      }

      case "gloves": {
        const gloves = loadJson("gloves");
        return NextResponse.json({ skins: gloves });
      }

      case "agents": {
        const agents = loadJson("agents");
        return NextResponse.json({ skins: agents });
      }

      case "music": {
        const music = loadJson("music");
        return NextResponse.json({ skins: music });
      }

      case "weapons": {
        const all = loadJson("skins");
        const seen = new Set<string>();
        const weapons: any[] = [];

        for (const s of all) {
          const di = s.weapon_defindex || 0;
          if (di >= 500 || di === 0) continue;
          const wn = s.weapon_name || "Other";
          if (seen.has(wn)) continue;
          seen.add(wn);

          const displayNames: Record<string, string> = {
            weapon_ak47: "AK-47",
            weapon_m4a1: "M4A4",
            weapon_m4a1_silencer: "M4A1-S",
            weapon_awp: "AWP",
            weapon_deagle: "Desert Eagle",
            weapon_usp_silencer: "USP-S",
            weapon_glock: "Glock-18",
            weapon_hkp2000: "P2000",
            weapon_elite: "Dual Berettas",
            weapon_fiveseven: "Five-SeveN",
            weapon_tec9: "Tec-9",
            weapon_cz75a: "CZ75-Auto",
            weapon_revolver: "R8 Revolver",
            weapon_p250: "P250",
            weapon_famas: "FAMAS",
            weapon_galilar: "Galil AR",
            weapon_aug: "AUG",
            weapon_sg556: "SG 553",
            weapon_ssg08: "SSG 08",
            weapon_scar20: "SCAR-20",
            weapon_g3sg1: "G3SG1",
            weapon_mac10: "MAC-10",
            weapon_mp9: "MP9",
            weapon_mp7: "MP7",
            weapon_mp5sd: "MP5-SD",
            weapon_ump45: "UMP-45",
            weapon_p90: "P90",
            weapon_bizon: "PP-Bizon",
            weapon_nova: "Nova",
            weapon_xm1014: "XM1014",
            weapon_mag7: "MAG-7",
            weapon_sawedoff: "Sawed-Off",
            weapon_m249: "M249",
            weapon_negev: "Negev",
            weapon_taser: "Zeus x27",
          };

          weapons.push({
            name: wn,
            display: displayNames[wn] || wn.replace("weapon_", ""),
            defindex: di,
          });
        }

        weapons.sort((a, b) => a.defindex - b.defindex);
        return NextResponse.json({ weapons });
      }

      case "skins": {
        const defindex = parseInt(req.nextUrl.searchParams.get("defindex") || "0");
        if (!defindex) return NextResponse.json({ skins: [] });

        const all = loadJson("skins");
        const result = all.filter((s) => (s.weapon_defindex || 0) === defindex);
        return NextResponse.json({ skins: result });
      }

      case "equipped": {
        const [skins, knife, gloves, agents, music] = await Promise.all([
          prisma.playerSkin.findMany({ where: { steamid } }),
          prisma.playerKnife.findMany({ where: { steamid } }),
          prisma.playerGlove.findMany({ where: { steamid } }),
          prisma.playerAgent.findUnique({ where: { steamid } }),
          prisma.playerMusic.findMany({ where: { steamid } }),
        ]);

        return NextResponse.json({ skins, knife, gloves, agents, music });
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch skins" }, { status: 500 });
  }
}
