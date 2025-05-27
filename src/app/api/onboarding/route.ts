import { getServerSession } from "@/lib/dal";
import { getOnboardingStatus } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { session } = await getServerSession();

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userOrganizationId = session.session.activeOrganizationId;

	try {
		if (!userOrganizationId) {
			return {
				onboarded: false,
				organizationCreated: false,
				packageCreated: false,
				bookingCreated: false,
				membersInvited: false,
			};
		}

		const onboardingStatus = await getOnboardingStatus(userOrganizationId);

		return NextResponse.json(onboardingStatus, { status: 200 });
	} catch (error) {
		console.error("Error fetching onboarding status:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
