import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const steamid = (session.user as any).steamid;
  const complaints = await prisma.complaint.findMany({ where: { steamid }, orderBy: { created_at: "desc" } });
  return NextResponse.json({ complaints });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const steamid = (session.user as any).steamid;
  const { title, message } = await req.json();
  if (!title || !message) return NextResponse.json({ error: "Title and message required" }, { status: 400 });
  
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
  
  const complaint = await prisma.complaint.create({ data: { steamid, title, message } });
  return NextResponse.json({ success: true, complaint });
}
