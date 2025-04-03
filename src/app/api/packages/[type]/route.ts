import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { packageConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  
  const config = await db.query.packageConfigs.findFirst({
    where: eq(packageConfigs.packageType, type),
  });

  if (!config) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}