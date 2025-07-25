"use client";

import { ChevronsUpDown, Diamond, DiamondIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useCrewParams } from "@/hooks/use-crew-params";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";
import { useExpenseParams } from "@/hooks/use-expense-params";
import { usePermissions } from "@/hooks/use-permissions";
import { useShootsParams } from "@/hooks/use-shoots-params";
import { useTaskParams } from "@/hooks/use-task-params";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function NewActionSwitcher() {
	const [open, setOpen] = React.useState(false);

	const { setParams: setShootParams } = useShootsParams();
	const { setParams: setDeliverablesParams } = useDeliverableParams();
	const { setParams: setTaskParams } = useTaskParams();
	const { setParams: setExpenseParams } = useExpenseParams();
	const { setParams: setCrewParams } = useCrewParams();

	const router = useRouter();

	const {
		canCreateAndUpdateBooking,
		canCreateAndUpdateShoot,
		canCreateAndUpdateDeliverable,
		canCreateAndUpdateExpense,
		canCreateAndUpdatePayment,
		canCreateAndUpdateTask,
		canCreateAndUpdateCrew,
	} = usePermissions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-label="Select a team"
					className={cn("w-[120px] justify-between ")}
				>
					<Plus className="mr-1 h-4 w-4 shrink-0" />
					<span>New</span>
					<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[220px]">
				{canCreateAndUpdateBooking && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							router.prefetch("/bookings/add");
							router.push(`/bookings/add`);
						}}
					>
						Add New Booking
					</DropdownMenuItem>
				)}

				{canCreateAndUpdateBooking && <DropdownMenuSeparator />}

				{canCreateAndUpdateShoot && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							setShootParams({ createShoot: true });
						}}
					>
						Add New Shoot
					</DropdownMenuItem>
				)}
				{canCreateAndUpdateDeliverable && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							setDeliverablesParams({ createDeliverable: true });
						}}
					>
						Add New Deliverables
					</DropdownMenuItem>
				)}
				{canCreateAndUpdateTask && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							setTaskParams({ createTask: true });
						}}
					>
						Add New Tasks
					</DropdownMenuItem>
				)}
				{(canCreateAndUpdateExpense || canCreateAndUpdatePayment) && (
					<DropdownMenuSeparator />
				)}
				{canCreateAndUpdatePayment && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
						}}
					>
						Add New Payment
					</DropdownMenuItem>
				)}
				{canCreateAndUpdateExpense && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							setExpenseParams({ createExpense: true });
						}}
					>
						Add New Expenses
					</DropdownMenuItem>
				)}
				{canCreateAndUpdateCrew && <DropdownMenuSeparator />}
				{canCreateAndUpdateCrew && (
					<DropdownMenuItem
						onSelect={() => {
							setOpen(false);
							setCrewParams({ createCrew: true });
						}}
					>
						Add New Crew
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
