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
import { useCrewParams } from "@/hooks/use-crew-params";
import { useDeleteCrewMutation } from "@/hooks/use-crews";
import { usePermissions } from "@/hooks/use-permissions";
import type { Crew } from "@/lib/db/schema";

interface CrewTableRowActionsProps {
	row: Row<Crew & { memberName?: string | null; memberEmail?: string | null }>;
}

export function CrewTableRowActions({ row }: CrewTableRowActionsProps) {
	const { setParams } = useCrewParams();
	const deleteCrewMutation = useDeleteCrewMutation();

	const { canCreateAndUpdateCrew } = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{canCreateAndUpdateCrew && (
					<DropdownMenuItem
						onClick={() =>
							setParams({
								crewId: row.original.id.toString(),
							})
						}
					>
						Edit crew member
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-destructive"
					onClick={() => deleteCrewMutation.mutate(row.original.id)}
				>
					Delete crew member
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
