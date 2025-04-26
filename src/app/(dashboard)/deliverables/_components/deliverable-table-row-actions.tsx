"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import type { Deliverable } from "@/lib/db/schema";

type Deliverablerow = Deliverable & { booking: { name: string } };

interface DeliverableTableRowActionsProps<TData> {
	row: Row<Deliverablerow>;
}

export function DeliverableTableRowActions<TData>({
	row,
}: DeliverableTableRowActionsProps<TData>) {
	const { setParams } = useDeliverableParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() =>
						setParams({ deliverableId: row.original.id.toString() })
					}
				>
					Edit deliverable
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete deliverable
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
