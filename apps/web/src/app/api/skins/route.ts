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
    weapon_defindex: Number(s.weapon_defindex) || 0,
    paint_name: s.paint_name || "Unknown",
  };
}

async function addCdnImage(skins: any[]): Promise<any[]> {
  return Promise.all(
    skins.map(async (s) => {
      const cdn = await getCdnImage(
        Number(s.weapon_defindex) || 0,
        Number(s.paint_id || s.paint) || 0
      );

      return cdn ? { ...s, cdnImage: cdn } : s;
    })
  );
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type") || "";
    const steamid = (session.user as any).steamid;

    // ===================== KNIVES =====================
    if (type === "knives") {
      const all = loadJson("skins").map((s, i) => ({
        ...normalizeSkin(s),
        id: i,
      }));

      const knives = all.filter((s) => s.weapon_defindex >= 500);

      return NextResponse.json({
        skins: await addCdnImage(knives),
      });
    }

    // ===================== GLOVES (FIX HERE) =====================
    if (type === "gloves") {
      const gloves = loadJson("gloves").map((g, i) => {
        const paintId = Number(g.paint ?? g.paint_id ?? 0);

        const weaponDef =
          Number(g.weapon_defindex) ||
          5034; // 🔥 CS2 gloves default fix

        const paintName = g.paint_name || g.name || "Unknown Gloves";

        const gloveType = paintName.includes(" | ")
          ? paintName.split(" | ")[0].trim()
          : "Gloves";

        return {
          id: i,
          ...g,
          paint_id: paintId,
          weapon_defindex: weaponDef,
          paint_name: paintName,
          weapon_name: gloveType,
        };
      });

      return NextResponse.json({
        skins: await addCdnImage(gloves),
      });
    }

    // ===================== AGENTS =====================
    if (type === "agents") {
      const agents = loadJson("agents").map((a, i) => ({
        id: i,
        paint_name: a.agent_name || a.name || "Unknown Agent",
        weapon_name:
          a.team === 2
            ? "T Terrorist"
            : a.team === 3
              ? "CT Counter-Terrorist"
              : "Agent",
        image: a.image || "",
        paint_id: a.team === 2 ? 2 : a.team === 3 ? 3 : 0,
        weapon_defindex: a.team === 2 ? 2 : a.team === 3 ? 3 : 0,
        rarity: "3",
        team: a.team,
        model: a.model || "",
      }));

      return NextResponse.json({ skins: agents });
    }

    // ===================== MUSIC =====================
    if (type === "music") {
      const music = loadJson("music").map((m, i) => ({
        id: i,
        paint_name: m.name || "Unknown Music Kit",
        weapon_name: "Music Kit",
        image: m.image || "",
        paint_id: Number(m.id) || 0,
        weapon_defindex: 0,
        rarity: "4",
      }));

      return NextResponse.json({ skins: music });
    }

    // ===================== PINS =====================
    if (type === "pins") {
      const pins = loadJson("collectibles").map((p, i) => ({
        id: i,
        paint_name: p.name || "Unknown Pin",
        weapon_name: "Pin",
        image: p.image || "",
        paint_id: Number(p.id) || 0,
        weapon_defindex: 0,
        rarity: "5",
      }));

      return NextResponse.json({ skins: pins });
    }

    // ===================== EQUIPPED =====================
    if (type === "equipped") {
      const targetSteamid =
        req.nextUrl.searchParams.get("steamid") || steamid;

      const [
        dbSkins,
        dbKnife,
        dbGloves,
        dbAgents,
        dbMusic,
        dbPins,
      ] = await Promise.all([
        prisma.wpSkin.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpKnife.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpGlove.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpAgent.findMany({ where: { steamid: targetSteamid } }),
        prisma.playerMusic.findMany({ where: { steamid: targetSteamid } }),
        prisma.wpPin.findMany({ where: { steamid: targetSteamid } }),
      ]);

      const allSkins = loadJson("skins").map(normalizeSkin);
      const allGloves = loadJson("gloves").map((g) => ({
        ...g,
        paint_id: Number(g.paint) || 0,
        weapon_defindex: Number(g.weapon_defindex) || 5034,
        paint_name: g.paint_name || g.name || "Unknown Gloves",
      }));

      const allKnives = allSkins.filter((s) => s.weapon_defindex >= 500);
      const allWeapons = allSkins.filter((s) => s.weapon_defindex < 500);

      // ===================== SKINS =====================
      const seenSkins = new Set<string>();
      const enrichedSkins: any[] = [];

      for (const s of dbSkins) {
        const match = allWeapons.find(
          (x) =>
            x.weapon_name === s.weapon &&
            x.paint_id === s.paint
        );

        if (!match) continue;

        const key = `${s.weapon}-${s.weapon_team}`;
        if (seenSkins.has(key)) continue;
        seenSkins.add(key);

        const cdn = await getCdnImage(
          match.weapon_defindex,
          s.paint
        );

        enrichedSkins.push({
          ...s,
          weapon_defindex: match.weapon_defindex,
          weapon_paint_id: s.paint,
          paint_name: match.paint_name,
          image: match.image || "",
          cdnImage: cdn,
          weapon_name: match.weapon_name,
        });
      }

      // ===================== KNIVES =====================
      const enrichedKnife = await Promise.all(
        dbKnife.map(async (k) => {
          const match = allKnives.find(
            (x) =>
              x.weapon_name === k.knife &&
              Number(x.paint_id) === k.paint
          );

          const fallback =
            allKnives.find(
              (x) => x.weapon_name === k.knife
            );

          const data = match || fallback;

          const defindex = data?.weapon_defindex || 0;
          const paintId = k.paint;

          const cdn = await getCdnImage(defindex, paintId);

          return {
            ...k,
            weapon_defindex: defindex,
            weapon_paint_id: paintId,
            paint_name: data?.paint_name || "Default Knife",
            image: data?.image || "",
            cdnImage: cdn,
          };
        })
      );

      // ===================== GLOVES (FIXED) =====================
      const enrichedGloves = await Promise.all(
        dbGloves.map(async (g) => {
          const defindex =
            Number(g.weapon_defindex) || 5034;

          const match = allGloves.find(
            (x) =>
              Number(x.weapon_defindex) === defindex
          );

          const paintId = match?.paint_id || 0;

          const cdn = await getCdnImage(defindex, paintId);

          return {
            ...g,
            weapon_defindex: defindex,
            weapon_paint_id: paintId,
            paint_name: match?.paint_name || "Default Gloves",
            image: match?.image || "",
            cdnImage: cdn,
            weapon_name: g.gloves || "Gloves",
          };
        })
      );

      // ===================== AGENTS =====================
      const allAgents = loadJson("agents");
      const allMusic = loadJson("music");
      const allPins = loadJson("collectibles");

      const enrichedAgents = dbAgents.map((a) => {
        const match =
          allAgents.find((x) => x.model === a.agent_t) ||
          allAgents.find((x) => x.model === a.agent_ct);

        return {
          ...a,
          paint_name: match?.agent_name || "Agent",
          image: match?.image || "",
        };
      });

      const enrichedMusic = dbMusic.map((m) => {
        const match = allMusic.find((x) => Number(x.id) === m.music_id);

        return {
          ...m,
          paint_name: match?.name || `Music Kit #${m.music_id}`,
          image: match?.image || "",
        };
      });

      const enrichedPins = dbPins.map((p) => {
        const match = allPins.find((x) => Number(x.id) === p.pin);

        return {
          ...p,
          paint_name: match?.name || `Pin #${p.pin}`,
          image: match?.image || "",
        };
      });

      return NextResponse.json({
        skins: enrichedSkins,
        knife: enrichedKnife,
        gloves: enrichedGloves,
        agents: enrichedAgents,
        music: enrichedMusic,
        pins: enrichedPins,
      });
    }

    // ===================== WEAPON FILTER =====================
    const defindexes = WEAPON_CATEGORIES[type];

    if (defindexes) {
      const all = loadJson("skins").map((s, i) => ({
        ...normalizeSkin(s),
        id: i,
      }));

      const result = all.filter((s) =>
        defindexes.includes(s.weapon_defindex)
      );

      return NextResponse.json({
        skins: await addCdnImage(result),
      });
    }

    return NextResponse.json(
      { error: "Invalid type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch skins" },
      { status: 500 }
    );
  }
}