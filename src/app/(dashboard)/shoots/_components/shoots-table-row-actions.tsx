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
import { usePermissions } from "@/hooks/use-permissions";
import { useShootsParams } from "@/hooks/use-shoots-params";
import type { ShootRowData } from "@/types/shoots";

interface ShootTableRowActionsProps {
	row: Row<ShootRowData>;
}

export function ShootTableRowActions({ row }: ShootTableRowActionsProps) {
	const { setParams } = useShootsParams();

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
								shootId: row.original.id.toString(),
							})
						}
					>
						Edit shoot
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete shoot
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
