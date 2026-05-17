import { NextResponse } from "next/server";
import { resetWeeklyStats } from "@/lib/cron";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = process.env.CRON_SECRET;
    if (authHeader) {
      // Optional: Add header validation
    }

    await resetWeeklyStats();
    return NextResponse.json({ success: true, message: "Weekly stats reset" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Weekly reset failed" },
      { status: 500 }
    );
  }
}
