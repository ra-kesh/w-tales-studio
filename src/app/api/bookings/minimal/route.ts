import { getServerSession } from "@/lib/dal";
import { getMinimalBookings } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);

    const fields = searchParams.get("fields") || "";

    const result = await getMinimalBookings(userOrganizationId, fields);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching bookings:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
