"use client";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPageSkeleton() {
	return (
		<div className="flex-1 min-w-0 py-6">
			{/* Top-level stats skeleton */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 px-6">
				<Skeleton className="h-28 w-full rounded-lg" />
				<Skeleton className="h-28 w-full rounded-lg" />
				<Skeleton className="h-28 w-full rounded-lg" />
				<Skeleton className="h-28 w-full rounded-lg" />
			</div>

			{/* Toolbar skeleton */}

			<div className="p-6">
				<div className="flex items-center justify-between mb-4">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-8 w-24" />
				</div>

				{/* Table skeleton */}
				<DataTableSkeleton
					columnCount={5} // Assuming a generic number of columns
					filterCount={0}
					cellWidths={["15rem", "10rem", "8rem", "6rem", "6rem"]}
					shrinkZero
				/>
			</div>
		</div>
	);
}
