import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { WEAPON_CATEGORIES, WEAPON_DISPLAY_NAMES } from "@/lib/weapon-categories";
import { getCdnImage } from "@/lib/skin-images";

export const dynamic = "force-dynamic";

const DATA_DIR = join(process.cwd(), "data");

function loadJson(filename: string): any[] {
  const lang = "_en";
  const paths = [
    join(DATA_DIR, `${filename}${lang}.json`),
    join(DATA_DIR, `${filename}.json`),
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

function normalizeSkin(s: any): any {
  return {
    ...s,
    paint_id: Number(s.paint) || 0,
    weapon_defindex: s.weapon_defindex || 0,
    paint_name: s.paint_name || "Unknown",
  };
}

async function addCdnImage(skins: any[]): Promise<any[]> {
  return Promise.all(skins.map(async (s) => {
    const cdn = await getCdnImage(s.weapon_defindex, Number(s.paint) || 0);
    return cdn ? { ...s, cdnImage: cdn } : s;
  }));
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type") || "";
    const steamid = (session.user as any).steamid;

    if (type === "knives") {
      const all = loadJson("skins").map(normalizeSkin);
      const knives = all.filter((s) => s.weapon_defindex >= 500);
      return NextResponse.json({ skins: await addCdnImage(knives) });
    }

    if (type === "gloves") {
      const gloves = loadJson("gloves").map((g: any) => {
        const paintName = g.paint_name || g.name || "Unknown Gloves";
        const gloveType = paintName.includes(" | ") ? paintName.split(" | ")[0].trim() : "Gloves";
        return {
          ...g,
          paint_id: Number(g.paint) || 0,
          weapon_defindex: g.weapon_defindex || 0,
          paint_name: paintName,
          weapon_name: gloveType,
        };
      });
      return NextResponse.json({ skins: await addCdnImage(gloves) });
    }

    if (type === "agents") {
      const agents = loadJson("agents").map((a: any) => ({
        paint_name: a.agent_name || a.name || "Unknown Agent",
        weapon_name: a.team === 2 ? "T" : a.team === 3 ? "CT" : "Agent",
        image: a.image || "",
        paint_id: a.team === 2 ? 2 : a.team === 3 ? 3 : 0,
        weapon_defindex: a.team === 2 ? 2 : a.team === 3 ? 3 : 0,
        rarity: "3",
        team: a.team,
      }));
      return NextResponse.json({ skins: agents });
    }

    if (type === "music") {
      const music = loadJson("music").map((m: any) => ({
        paint_name: m.name || "Unknown Music Kit",
        weapon_name: "Music Kit",
        image: m.image || "",
        paint_id: m.id || 0,
        weapon_defindex: 0,
        rarity: "4",
      }));
      return NextResponse.json({ skins: music });
    }

    if (type === "weapons") {
      const all = loadJson("skins").map(normalizeSkin);
      const seen = new Set<string>();
      const weapons: any[] = [];

      for (const s of all) {
        const di = s.weapon_defindex || 0;
        if (di >= 500 || di === 0) continue;
        const wn = s.weapon_name || "Other";
        if (seen.has(wn)) continue;
        seen.add(wn);

        weapons.push({
          name: wn,
          display: WEAPON_DISPLAY_NAMES[wn] || wn.replace("weapon_", ""),
          defindex: di,
        });
      }

      weapons.sort((a, b) => a.defindex - b.defindex);
      return NextResponse.json({ weapons });
    }

    if (type === "equipped") {
      const targetSteamid = req.nextUrl.searchParams.get("steamid") || steamid;
      const [dbSkins, dbKnife, dbGloves, dbMusic] = await Promise.all([
        prisma.wpSkin.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpKnife.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpGlove.findMany({ where: { steamid: targetSteamid } }),
        prisma.playerMusic.findMany({ where: { steamid: targetSteamid } }),
      ]);

      const allSkins = loadJson("skins").map(normalizeSkin);
      const allGloves = loadJson("gloves").map((g: any) => ({
        ...g,
        paint_id: Number(g.paint) || 0,
        paint_name: g.paint_name || g.name || "Unknown Gloves",
      }));
      const allKnives = allSkins.filter((s: any) => s.weapon_defindex >= 500);
      const allWeapons = allSkins.filter((s: any) => s.weapon_defindex < 500);

      const enrichedSkins = await Promise.all(dbSkins.map(async (s) => {
        const match = allWeapons.find((x: any) => x.weapon_name === s.weapon && x.paint_id === s.paint);
        const defindex = match?.weapon_defindex || 0;
        const cdn = await getCdnImage(defindex, s.paint);
        return { ...s, weapon_defindex: defindex, weapon_paint_id: s.paint, paint_name: match?.paint_name || "Unknown", image: match?.image || "", cdnImage: cdn, weapon_name: match?.weapon_name || s.weapon };
      }));

      const enrichedKnife = await Promise.all(dbKnife.map(async (k) => {
        const match = allKnives.find((x: any) => x.weapon_name === k.knife);
        const defindex = match?.weapon_defindex || 0;
        const paintId = k.paint || match?.paint_id || 0;
        const cdn = await getCdnImage(defindex, paintId);
        return { ...k, weapon_defindex: defindex, weapon_paint_id: paintId, paint_name: match?.paint_name || "Default Knife", image: match?.image || "", cdnImage: cdn };
      }));

      const enrichedGloves = await Promise.all(dbGloves.map(async (g) => {
        const match = allGloves.find((x: any) => x.weapon_defindex === g.weapon_defindex);
        const paintId = match?.paint_id || 0;
        const cdn = await getCdnImage(g.weapon_defindex, paintId);
        return { ...g, weapon_paint_id: paintId, paint_name: match?.paint_name || "Default Gloves", image: match?.image || "", cdnImage: cdn, weapon_name: g.gloves || "" };
      }));

      return NextResponse.json({
        skins: enrichedSkins,
        knife: enrichedKnife,
        gloves: enrichedGloves,
        agents: null,
        music: dbMusic,
      });
    }

    const defindexes = WEAPON_CATEGORIES[type];
    if (defindexes) {
      const all = loadJson("skins").map(normalizeSkin);
      const result = all.filter((s) => defindexes.includes(s.weapon_defindex));
      return NextResponse.json({ skins: await addCdnImage(result) });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch skins" }, { status: 500 });
  }
}
