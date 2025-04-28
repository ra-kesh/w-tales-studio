import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { getClientDetail } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import { clients } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ClientSchema } from "@/app/(dashboard)/clients/_components/client-form-schema";

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
    const clientId = Number.parseInt(id, 10);

    const client = await getClientDetail(userOrganizationId, clientId);

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error: unknown) {
    console.error("Error fetching client:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const clientId = Number.parseInt(id, 10);
    const body = await request.json();

    const validation = ClientSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const [updatedClient] = await db
      .update(clients)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.organizationId, userOrganizationId)
        )
      )
      .returning();

    if (!updatedClient) {
      return NextResponse.json(
        { message: "Client not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          clientId: updatedClient.id,
        },
        message: "Client updated successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating client:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
