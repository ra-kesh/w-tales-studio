import { NextResponse } from "next/server";
import { getTask, updateTask } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

export async function GET(
	request: Request,
	{ params }: { params: { taskId: string } },
) {
	const { session } = await getServerSession();
	if (!session?.session.activeOrganizationId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const task = await getTask(
			session.session.activeOrganizationId,
			Number.parseInt(params.taskId),
		);
		return NextResponse.json(task);
	} catch (error) {
		console.error(error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { taskId: string } },
) {
	const { session } = await getServerSession();
	if (!session?.session.activeOrganizationId) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		const body = await request.json();
		const task = await updateTask(
			session.session.activeOrganizationId,
			Number.parseInt(params.taskId),
			{
				...body,
				bookingId: body.bookingId ? Number.parseInt(body.bookingId) : undefined,
				dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
			},
		);
		return NextResponse.json(task);
	} catch (error) {
		console.error(error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
