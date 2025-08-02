"use client";

import type { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookingParams } from "@/hooks/use-booking-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { Booking } from "@/lib/db/schema";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
}

export function BookingTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const booking = row.original as Booking;

	const { canCreateAndUpdateBooking } = usePermissions();

	const { setParams } = useBookingParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontal />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem
					disabled={!canCreateAndUpdateBooking}
					onClick={() => setParams({ updateBookingId: booking.id.toString() })}
				>
					Edit
				</DropdownMenuItem>
				{/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
