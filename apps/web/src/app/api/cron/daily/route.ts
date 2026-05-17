import { NextResponse } from "next/server";
import { setDailyPlayer } from "@/lib/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const dailyPlayer = await setDailyPlayer();
    return NextResponse.json({
      success: true,
      player: dailyPlayer,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Daily player selection failed" },
      { status: 500 }
    );
  }
}
