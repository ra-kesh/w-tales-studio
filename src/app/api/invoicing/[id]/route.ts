
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/dal";
import { db } from "@/lib/db/drizzle";
import { invoices, invoice_line_items } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";

const InvoiceUpdateSchema = z.object({
  invoice_number: z.string().optional(),
  issue_date: z.string().optional(),
  due_date: z.string().optional(),
  total_amount: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const id = Number.parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const invoice = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));

    if (!invoice) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    const line_items = await db
      .select()
      .from(invoice_line_items)
      .where(eq(invoice_line_items.invoice_id, id));

    return NextResponse.json({ ...invoice, line_items });
  } catch (err) {
    console.error("Error fetching invoice:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const id = Number.parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const parse = InvoiceUpdateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parse.error.errors },
      { status: 400 }
    );
  }
  const data = parse.data;

  try {
    await db
      .update(invoices)
      .set(data)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));

    return NextResponse.json({ message: "Invoice updated successfully" });
  } catch (err) {
    console.error("Error updating invoice:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

  const id = Number.parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.organizationId, orgId)));

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
