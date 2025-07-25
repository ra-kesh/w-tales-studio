import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/dal";
import { getMinimalDeliverables } from "@/lib/db/queries";

export async function GET(
  request: Request,
) {
  const { session } = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userOrganizationId = session.session.activeOrganizationId;

  if (!userOrganizationId) {
    return NextResponse.json(
      { message: "User not associated with an organization" },
      { status: 403 },
    );
  }

  const canReadDeliverables = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        deliverable: ["read"],
      },
    },
  });

  if (!canReadDeliverables) {
    return NextResponse.json(
      { message: "You do not have permission to read deliverables." },
      { status: 403 },
    );
  }

  try {
    const url = new URL(request.url);
    const bookingId = url.searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 },
      );
    }

    const response = await getMinimalDeliverables(
      userOrganizationId,
      Number.parseInt(bookingId, 10),
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching minimal deliverables:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 },
    );
  }
}