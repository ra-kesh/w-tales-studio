import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "@/lib/dal";

export async function GET() {
  try {
    const { session } = await getServerSession();

    if (!session?.user?.id || !session?.session?.activeOrganizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeOrganizationId = session.session.activeOrganizationId;

    const organizationMembers = await db
      .select({
        memberId: members.id,
        userId: members.userId,
        role: members.role,
        joinedAt: members.createdAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .where(eq(members.organizationId, activeOrganizationId));

    return NextResponse.json(organizationMembers, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
