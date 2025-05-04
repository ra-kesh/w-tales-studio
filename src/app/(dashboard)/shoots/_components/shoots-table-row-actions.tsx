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
import { useShootsParams } from "@/hooks/use-shoots-params";
import type { Shoot } from "@/lib/db/schema";

type ShootRowData = Shoot & {
	booking: { name: string };
	shootsAssignments: Array<{
		crew: {
			name: string | null;
			role: string | null;
		};
	}>;
};

interface ShootTableRowActionsProps {
	row: Row<ShootRowData>;
}
export function ShootTableRowActions({ row }: ShootTableRowActionsProps) {
	const { setParams } = useShootsParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{/* <DropdownMenuItem>View details</DropdownMenuItem> */}
				<DropdownMenuItem
					onClick={() =>
						setParams({
							shootId: row.original.id.toString(),
						})
					}
				>
					Edit shoot
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete shoot
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
