"use client";

import { type ColumnDef, flexRender, type Table } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Table as UITable,
} from "@/components/ui/table";
import type { Booking, Shoot } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface BookingTableProps extends React.ComponentProps<"div"> {
	table: Table<Booking & { shoots: Shoot[] }>;
	columns: ColumnDef<Booking & { shoots: Shoot[] }>[];
}

export function BookingTable({
	table,
	columns,
	children,
	...props
}: BookingTableProps) {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const currentBookingId = params?.id;

	const handleRowClick = (id: number) => {
		router.prefetch(`/bookings/${id}?${searchParams.toString() ?? null}`);
		router.push(`/bookings/${id}?${searchParams.toString()}`);
	};

	return (
		<div className="space-y-4 " {...props}>
			<div className="rounded-md border">
				<UITable>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<React.Fragment key={row.id}>
									<TableRow
										data-state={row.getIsSelected() && "selected"}
										onClick={() => handleRowClick((row.original as Booking).id)}
										className={cn(
											"cursor-pointer hover:bg-muted/50",
											currentBookingId ===
												(row.original as Booking).id.toString() && "bg-muted",
										)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
									{row.getIsExpanded() && (
										<TableRow className="bg-muted/30 transition-colors">
											<TableCell className="p-0" colSpan={4} />
											<TableCell className="p-0" colSpan={1}>
												<div className="p-4 rounded-md bg-card border border-border/50 m-2 shadow-sm">
													<div className="flex items-center justify-between mb-3">
														<h4 className="text-sm font-medium flex items-center">
															<span className="bg-primary/10 text-primary p-1 rounded-md mr-2">
																<Calendar className="h-4 w-4" />
															</span>
															Shoot Details
														</h4>
														<Badge
															variant="outline"
															className="text-xs font-normal"
														>
															{row.original.shoots.length}{" "}
															{row.original.shoots.length === 1
																? "shoot"
																: "shoots"}
														</Badge>
													</div>
													<UITable>
														<TableBody>
															{row.original.shoots.map(
																(shoot: Shoot, index: number) => (
																	<TableRow key={index}>
																		<TableCell className="space-y-1">
																			<div className="font-medium text-sm">
																				{shoot.title || "Untitled Shoot"}
																			</div>
																			<div className="text-xs text-muted-foreground flex items-center">
																				<MapPin className="h-3 w-3 mr-1 inline" />
																				{(shoot.location as string) ||
																					"No location specified"}
																			</div>
																		</TableCell>

																		<TableCell className="space-y-1">
																			<div className="font-medium text-sm flex items-center justify-end">
																				<Clock className="h-3 w-3 mr-1 inline" />
																				{shoot.time || "Time not specified"}
																			</div>
																			<div className="text-xs text-muted-foreground text-right">
																				{shoot.date
																					? format(
																							new Date(shoot.date),
																							"EEEE, MMM dd, yyyy",
																						)
																					: "Date not specified"}
																			</div>
																			{row.original.shoots.length === 0 && (
																				<div className="text-center py-6 text-sm text-muted-foreground">
																					No shoots scheduled for this booking
																				</div>
																			)}
																		</TableCell>
																	</TableRow>
																),
															)}
														</TableBody>
													</UITable>
												</div>
											</TableCell>
											<TableCell className="p-0" colSpan={1} />
											<TableCell className="p-0" colSpan={1} />
										</TableRow>
									)}
								</React.Fragment>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</UITable>
			</div>
			{children}
		</div>
	);
}
