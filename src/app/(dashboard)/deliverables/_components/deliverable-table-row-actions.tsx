"use client";

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
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { DeliverableRowData } from "@/types/deliverables";

interface DeliverableTableRowActionsProps<TData> {
	row: Row<DeliverableRowData>;
}

export function DeliverableTableRowActions<TData>({
	row,
}: DeliverableTableRowActionsProps<TData>) {
	const { setParams } = useDeliverableParams();

	const { canCreateAndUpdateDeliverable } = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{canCreateAndUpdateDeliverable && (
					<DropdownMenuItem
						onClick={() =>
							setParams({ deliverableId: row.original.id.toString() })
						}
					>
						Edit deliverable
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete deliverable
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
