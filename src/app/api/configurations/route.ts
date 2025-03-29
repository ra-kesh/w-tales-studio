import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db/drizzle";
import { ConfigType, configurations } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, or, isNull, and } from "drizzle-orm";

const configTypeValues = ConfigType.enumValues as string[];

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { message: "Missing required query parameter: type" },
        { status: 400 }
      );
    }

    if (!configTypeValues.includes(type)) {
      // Validate that type is a valid ConfigType value
      return NextResponse.json(
        {
          message: `Invalid type. Must be one of: ${configTypeValues.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const configs = await db.query.configurations.findMany({
      where: and(
        eq(configurations.type, type as (typeof ConfigType.enumValues)[number]), // Cast type to the correct union type
        or(
          eq(configurations.organizationId, userOrganizationId),
          eq(configurations.isSystem, true)
        )
      ),
      orderBy: configurations.isSystem, // Prioritize organization-specific (isSystem = false) over system-wide
    });

    return NextResponse.json(configs, { status: 200 });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
