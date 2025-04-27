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
import type { Client } from "@/lib/db/schema";
import { useClientParams } from "@/hooks/use-client-params";

interface ClientTableRowActionsProps<TData> {
	row: Row<TData>;
}

export function ClientTableRowActions<TData>({
	row,
}: ClientTableRowActionsProps<TData>) {
	const { setParams } = useClientParams();
	const client = row.original as Client;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => setParams({ clientId: client.id.toString() })}
				>
					Edit client
				</DropdownMenuItem>
				<DropdownMenuItem>View bookings</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-destructive">
					Delete client
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
