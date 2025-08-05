"use client";

import { ConvertScheduleSheet } from "./convert-schedule-sheet";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { ScheduledPaymentRow } from "@/types/payments";

interface ScheduledPaymentTableRowActionsProps {
	row: Row<ScheduledPaymentRow>;
}

export function ScheduledPaymentsRowActions({
	row,
}: ScheduledPaymentTableRowActionsProps) {
	const { setParams } = usePaymentsParams();

	const { canCreateAndUpdateShoot } = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{canCreateAndUpdateShoot && (
					<DropdownMenuItem
						onClick={() =>
							setParams({
								scheduledPaymentId: row.original.id.toString(),
							})
						}
					>
						Edit Payment
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<ConvertScheduleSheet schedule={row.original}>
					<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
						Mark as Paid
					</DropdownMenuItem>
				</ConvertScheduleSheet>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
