"use client";

import {
	type ColumnDef,
	flexRender,
	type Table as TanstackTable,
} from "@tanstack/react-table";
import { Crown, Users } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ShootRowData } from "@/types/shoots";

interface ShootTableProps {
	columns: ColumnDef<ShootRowData>[];
	table: TanstackTable<ShootRowData>;
	children: React.ReactNode;
}

export function ShootTable({ columns, table, children }: ShootTableProps) {
	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
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
									<TableRow data-state={row.getIsSelected() && "selected"}>
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
										<TableRow className="bg-muted/30">
											<TableCell className="p-0" colSpan={5} />
											<TableCell className="p-0" colSpan={1}>
												<div className="p-4 rounded-md bg-card border border-border/50 m-2 shadow-sm">
													<div className="flex items-center justify-between mb-4">
														<div className="flex items-center gap-2">
															<span className="bg-primary/10 text-primary p-1.5 rounded-md">
																<Users className="h-4 w-4" />
															</span>
															<h4 className="text-sm font-medium">
																Assigned Crew
															</h4>
														</div>
														<div className="flex items-center gap-2">
															<Badge
																variant="secondary"
																className="text-xs font-normal"
															>
																{(() => {
																	const assignedCount =
																		row.original.shootsAssignments.length;
																	const requiredCount =
																		row.original.additionalDetails
																			?.requiredCrewCount;

																	if (
																		requiredCount &&
																		Number(requiredCount) > 0
																	) {
																		return `${assignedCount} / ${requiredCount} assigned`;
																	}

																	return `${assignedCount} ${
																		assignedCount === 1 ? "member" : "members"
																	}`;
																})()}
															</Badge>
														</div>
													</div>
													<div className="space-y-3">
														{row.original.shootsAssignments.map(
															(assignment, index) => {
																const name =
																	assignment.crew.member?.user?.name ||
																	assignment.crew.name;
																const initials = name
																	?.split(" ")
																	.map((n) => n[0])
																	.join("");

																return (
																	<div
																		key={index}
																		className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
																	>
																		<div className="flex items-center gap-3">
																			<Avatar className="h-8 w-8">
																				<AvatarFallback className="bg-primary/10 text-primary">
																					{initials}
																				</AvatarFallback>
																			</Avatar>
																			<div>
																				<div className="font-medium flex items-center gap-2">
																					{name}
																					{assignment.isLead && (
																						<Badge
																							variant="secondary"
																							className="h-5 text-xs gap-1 flex items-center"
																						>
																							<Crown className="h-3 w-3" />
																							Lead
																						</Badge>
																					)}
																				</div>
																				<div className="text-sm text-muted-foreground flex items-center gap-2">
																					<span>{assignment.crew.role}</span>
																					{assignment.crew.specialization && (
																						<>
																							<span className="text-muted-foreground/30">
																								•
																							</span>
																							<span>
																								{assignment.crew.specialization}
																							</span>
																						</>
																					)}
																				</div>
																			</div>
																		</div>
																	</div>
																);
															},
														)}
														{row.original.shootsAssignments.length === 0 && (
															<div className="text-center py-6 text-sm text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
																No crew members assigned to this shoot
															</div>
														)}
													</div>
												</div>
											</TableCell>
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
				</Table>
			</div>
			{children}
		</div>
	);
}
