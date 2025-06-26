
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { invoices, invoice_line_items } from "@/lib/db/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

const InvoiceSchema = z.object({
  booking_id: z.number(),
  invoice_number: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
  total_amount: z.number(),
  status: z.string(),
  notes: z.string().optional(),
  line_items: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
      total_price: z.number(),
    })
  ),
});

export async function POST(request: Request) {
  const { session } = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    return NextResponse.json(
      { message: "User not associated with an organization" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parse = InvoiceSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parse.error.errors },
      { status: 400 }
    );
  }
  const data = parse.data;

  try {
    const newInvoiceId = await db.transaction(async (tx) => {
      const [inv] = await tx
        .insert(invoices)
        .values({
          booking_id: data.booking_id,
          invoice_number: data.invoice_number,
          issue_date: data.issue_date,
          due_date: data.due_date,
          total_amount: data.total_amount,
          status: data.status,
          notes: data.notes,
        })
        .returning({ id: invoices.id });

      const invoiceId = inv.id;

      await tx.insert(invoice_line_items).values(
        data.line_items.map((item) => ({
          invoice_id: invoiceId,
          ...item,
        }))
      );

      return invoiceId;
    });

    return NextResponse.json(
      {
        data: { invoiceId: newInvoiceId },
        message: "Invoice created successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating invoice:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("perPage") || "10", 10);

    const results = await db
      .select()
      .from(invoices)
      .where(eq(invoices.organizationId, userOrganizationId))
      .limit(limit)
      .offset((page - 1) * limit);

    return NextResponse.json(
      {
        data: results,
        page,
        perPage: limit,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching invoices:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
