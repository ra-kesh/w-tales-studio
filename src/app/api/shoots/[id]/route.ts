import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { shoots } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { session } = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userOrganizationId = session.session.activeOrganizationId;

  if (!userOrganizationId) {
    return NextResponse.json(
      { message: "User not associated with an organization" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const shootId = Number.parseInt(id, 10);

    const shoot = await db.query.shoots.findFirst({
      where: and(
        eq(shoots.id, shootId),
        eq(shoots.organizationId, userOrganizationId)
      ),
      with: {
        booking: true,
      },
    });

    if (!shoot) {
      return NextResponse.json({ message: "Shoot not found" }, { status: 404 });
    }

    return NextResponse.json(shoot, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching shoot:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
