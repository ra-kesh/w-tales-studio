"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Package2 } from "lucide-react";
import type { Deliverable } from "@/lib/db/schema";
import { DeliverableTable } from "@/app/(dashboard)/deliverables/_components/deliverable-table";
import { useBookingDeliverableColumns } from "./booking-deliverable-column";

export function BookingDeliverables({
	deliverables,
}: {
	deliverables: Deliverable[];
}) {
	const columns = useBookingDeliverableColumns();

	return <DeliverableTable data={deliverables} columns={columns} />;
}
