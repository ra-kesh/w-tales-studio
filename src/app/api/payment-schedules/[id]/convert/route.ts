import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import {
	attachments,
	paymentSchedules,
	receivedAmounts,
} from "@/lib/db/schema";

const convertScheduleSchema = z.object({
	amount: z.string(),
	paidOn: z.string(),
	description: z.string().optional(),
	attachment: z.any().optional(),
});

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { session } = await getServerSession();
	if (!session?.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}
	const orgId = session.session.activeOrganizationId;
	if (!orgId) {
		return NextResponse.json(
			{ message: "User not associated with an organization" },
			{ status: 403 },
		);
	}

	const { id } = await params;

	const scheduleId = Number.parseInt(id, 10);
	if (Number.isNaN(scheduleId)) {
		return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
	}

	const body = await request.json();
	const parse = convertScheduleSchema.safeParse(body);
	if (!parse.success) {
		return NextResponse.json({ errors: parse.error.issues }, { status: 400 });
	}
	const { amount, paidOn, description, attachment } = parse.data;

	try {
		await db.transaction(async (tx) => {
			const [newReceivedAmount] = await tx
				.insert(receivedAmounts)
				.values({
					organizationId: orgId,
					bookingId:
						(
							await tx.query.paymentSchedules.findFirst({
								where: eq(paymentSchedules.id, scheduleId),
							})
						)?.bookingId ?? 0,
					amount,
					paidOn,
					description,
					paymentScheduleId: scheduleId,
				})
				.returning();

			if (attachment) {
				await tx.insert(attachments).values({
					organizationId: orgId,
					resourceType: "received_payment",
					resourceId: newReceivedAmount.id.toString(),
					subType: "payment_proof",
					fileName: attachment.name,
					filePath: attachment.key,
					fileSize: attachment.size,
					mimeType: attachment.type,
					uploadedBy: session.user.id,
				});
			}

			await tx
				.update(paymentSchedules)
				.set({ status: "paid" })
				.where(eq(paymentSchedules.id, scheduleId));
		});

		return NextResponse.json(
			{ message: "Conversion successful" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error converting payment schedule:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
