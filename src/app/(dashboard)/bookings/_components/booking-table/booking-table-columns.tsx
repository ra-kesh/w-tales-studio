"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking, Client, Shoot } from "@/lib/db/schema";
import { BookingTableRowActions } from "./booking-table-row-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
	Camera,
	ChevronRight,
	Calendar,
	Mail,
	Phone,
	DollarSign,
	Tag,
	Package,
	Users,
} from "lucide-react";

export const useBookingColumns = () => {
	const columns: ColumnDef<Booking>[] = [
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
				const bookingName = row.getValue("name") as string;
				const type = row.original.bookingType;
				return (
					<div className="flex items-center gap-3">
						<div className="font-medium">{bookingName}</div>
						<Badge
							variant="outline"
							className="bg-primary/5 hover:bg-primary/10"
						>
							{type || "Not specified"}
						</Badge>
					</div>
				);
			},
		},
		// {
		//   accessorKey: "bookingType",
		//   header: () => (
		//     <div className="flex items-center gap-1">
		//       <Tag className="h-4 w-4" />
		//       <span>Type</span>
		//     </div>
		//   ),
		//   cell: ({ row }) => {
		//     const type = row.getValue("bookingType") as string;
		//     return (
		//       <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">
		//         {type || "Not specified"}
		//       </Badge>
		//     );
		//   },
		// },
		{
			accessorKey: "packageType",
			header: () => (
				<div className="flex items-center gap-1">
					<Package className="h-4 w-4" />
					<span>Package</span>
				</div>
			),
			cell: ({ row }) => {
				const cost = row.original.packageCost;
				const formatted =
					typeof cost === "number" || typeof cost === "string"
						? new Intl.NumberFormat("en-US", {
								style: "currency",
								currency: "USD",
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							}).format(Number(cost))
						: "$0";

				return (
					<div className="flex items-center gap-3">
						<div className="flex flex-col gap-1">
							<div className="flex items-center ">
								<span className=" font-medium tabular-nums">{formatted}</span>
							</div>
							<span className="text-md text-muted-foreground">
								{row.original.packageType}
							</span>
						</div>
					</div>
				);
			},
		},

		{
			accessorKey: "shoots",
			header: () => (
				<div className="flex items-center gap-1">
					<Calendar className="h-4 w-4" />
					<span>Shoots</span>
				</div>
			),
			cell: ({ row }) => {
				const shoots = row.getValue("shoots") as Shoot[];
				const count = shoots?.length || 0;
				const hasShootDetails = count > 0;

				const shootDetailHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
					e.stopPropagation();
					row.toggleExpanded();
				};

				return (
					<div className="relative">
						<Button
							variant={hasShootDetails ? "outline" : "ghost"}
							size="sm"
							className={cn(
								"gap-2 w-full justify-start transition-colors group",
								hasShootDetails
									? "cursor-pointer hover:bg-primary/5 border-primary/20"
									: "opacity-70 cursor-default text-muted-foreground",
							)}
							onClick={hasShootDetails ? shootDetailHandler : undefined}
						>
							{hasShootDetails && (
								<ChevronRight
									className={cn(
										"h-4 w-4 text-primary transition-transform duration-200",
										row.getIsExpanded() && "transform rotate-90",
									)}
								/>
							)}
							<Camera
								className={cn(
									"h-4 w-4",
									hasShootDetails ? "text-primary" : "text-muted-foreground",
								)}
							/>
							<div className="flex flex-col items-start">
								<span className="tabular-nums font-medium">
									{count
										? `${count} shoot${count > 1 ? "s" : ""} scheduled`
										: "No shoots scheduled"}
								</span>
							</div>
						</Button>
					</div>
				);
			},
		},
		{
			accessorKey: "clients",
			header: () => (
				<div className="flex items-center gap-1">
					<Users className="h-4 w-4" />
					<span>Contact</span>
				</div>
			),
			cell: ({ row }) => {
				const clients = row.getValue("clients") as Client;
				if (!clients)
					return <div className="text-muted-foreground">No contact info</div>;

				return (
					<div className="space-y-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5 text-sm">
										<Phone className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="font-medium tabular-nums">
											{clients.phoneNumber || "N/A"}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p>Call client</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5 text-xs">
										<Mail className="h-3 w-3 text-muted-foreground" />
										<span className="truncate max-w-[180px]">
											{clients.email || "N/A"}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<p>Email client</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <BookingTableRowActions row={row} />,
		},
	];

	return columns;
};
