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
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";
import type { ReceivedPaymentRow } from "@/types/payments";

interface ReceivedPaymentTableRowActionsProps {
	row: Row<ReceivedPaymentRow>;
}

export function ReceivedPaymentsRowActions({
	row,
}: ReceivedPaymentTableRowActionsProps) {
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
								receivedPaymentId: row.original.id.toString(),
							})
						}
					>
						Edit Payment
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				{/* <DropdownMenuItem className="text-destructive">
                    Delete Payment
                </DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
