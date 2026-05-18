import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const steamid = (session.user as any).steamid;
  const appeals = await prisma.appeal.findMany({ where: { steamid }, orderBy: { created_at: "desc" } });
  return NextResponse.json({ appeals });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const steamid = (session.user as any).steamid;
  const { type, reason, message } = await req.json();
  if (!type || !message) return NextResponse.json({ error: "Type and message required" }, { status: 400 });
  
  // Ensure user exists (fix foreign key constraint)
  const existingUser = await prisma.user.findUnique({ where: { steamid } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        steamid,
        username: (session.user as any).username || "Unknown",
        avatar: (session.user as any).avatar || "",
      },
    });
  }
  
  const appeal = await prisma.appeal.create({ data: { steamid, type, reason: reason || "", message } });
  return NextResponse.json({ success: true, appeal });
}
