import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package } from "lucide-react";

interface PackageTableProps {
	data: any[];
	onEdit: (id: number) => void;
	onDelete: (id: number) => void;
}

export function PackageTable({ data, onEdit, onDelete }: PackageTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Cost</TableHead>
					<TableHead>Booking Type</TableHead>
					<TableHead>Deliverables</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((pkg) => (
					<TableRow key={pkg.id}>
						<TableCell className="font-medium">
							<div className="flex items-center gap-2">{pkg.label}</div>
						</TableCell>

						<TableCell>₹{pkg.metadata.defaultCost}</TableCell>
						<TableCell>Wedding</TableCell>
						<TableCell>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" size="sm" className="gap-2">
										<Package className="h-4 w-4" />
										<span>
											{pkg.metadata.defaultDeliverables?.length || 0} items
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-0" align="start">
									<div className="p-3 border-b">
										<h4 className="font-medium">Package Deliverables</h4>
										<p className="text-sm text-muted-foreground">
											Items included in {pkg.label}
										</p>
									</div>
									<ScrollArea className="h-[200px]">
										<div className="p-3 space-y-2">
											{pkg.metadata.defaultDeliverables?.map(
												(item: any, index: number) => (
													<div
														key={index}
														className="flex items-center justify-between py-2 border-b last:border-0"
													>
														<div>
															<p className="font-medium">{item.title}</p>
															{item.is_package_included && (
																<Badge variant="secondary" className="text-xs">
																	Package Included
																</Badge>
															)}
														</div>
														<div className="text-sm font-medium">
															Qty: {item.quantity}
														</div>
													</div>
												),
											)}
										</div>
									</ScrollArea>
								</PopoverContent>
							</Popover>
						</TableCell>

						<TableCell className="text-right">
							<div className="flex justify-end gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onEdit(pkg.id)}
								>
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onDelete(pkg.id)}
								>
									<Trash className="h-4 w-4" />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
