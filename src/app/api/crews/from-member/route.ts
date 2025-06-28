// app/api/crews/create-from-member/route.ts (New File)

import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { members, crews, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
	// 1. Get the current user's session. This user has JUST accepted the invitation.
	const session = await auth.api.getSession({
		headers: await request.headers,
	});

	if (!session?.user?.id) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	// The active organization might not be set yet, so we find the LATEST membership.
	const latestMembership = await db.query.members.findFirst({
		where: eq(members.userId, session.user.id),
		orderBy: (members, { desc }) => [desc(members.createdAt)],
	});

	if (!latestMembership) {
		return NextResponse.json(
			{ message: "No membership found for the current user." },
			{ status: 404 },
		);
	}

	// 2. Check if a crew record already exists for this member to prevent duplicates.
	const existingCrew = await db.query.crews.findFirst({
		where: eq(crews.memberId, latestMembership.id),
	});

	if (existingCrew) {
		return NextResponse.json(
			{ message: "Crew member already exists." },
			{ status: 200 },
		);
	}

	// 3. Create the new crew record.
	const newCrew = await db
		.insert(crews)
		.values({
			organizationId: latestMembership.organizationId,
			memberId: latestMembership.id,
			name: session.user.name,
			email: session.user.email,
			role: latestMembership.role,
			status: "available",
		})
		.returning();

	return NextResponse.json(newCrew[0], { status: 201 });
}
