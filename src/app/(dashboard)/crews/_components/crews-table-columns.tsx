"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { CrewTableRowActions } from "./crew-table-row-actions";
import type { Crew } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const useCrewColumns = () => {
	const columns: ColumnDef<
		Crew & { memberName?: string | null; memberEmail?: string | null }
	>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				const name = row.original.name || row.original.memberName;
				const email = row.original.email || row.original.memberEmail;
				const initials = name
					?.split(" ")
					.map((n) => n[0])
					.join("");

				return (
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="font-medium">{name}</span>
							{email && (
								<span className="text-xs text-muted-foreground">{email}</span>
							)}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "specialization",
			header: "Specialization",
		},
		{
			accessorKey: "role",
			header: "Role",
		},
		{
			accessorKey: "phoneNumber",
			header: "Phone",
		},
		{
			accessorKey: "equipment",
			header: "Equipment",
			cell: ({ row }) => {
				const equipment = row.original.equipment || [];
				return (
					<div className="flex flex-wrap gap-1">
						{equipment.map((item, index) => (
							<Badge key={index} variant="secondary" className="text-xs">
								{item}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={
							status === "available"
								? "outline"
								: status === "on-leave"
									? "secondary"
									: "destructive"
						}
					>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <CrewTableRowActions row={row} />,
		},
	];

	return columns;
};
