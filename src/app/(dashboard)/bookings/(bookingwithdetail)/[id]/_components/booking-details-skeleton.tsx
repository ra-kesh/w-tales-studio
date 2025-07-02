"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CustomTabsList, CustomTabsTrigger, Tabs } from "@/components/ui/tabs";
import { Camera, CheckSquare, Image, Info } from "lucide-react";

export function BookingDetailsSkeleton() {
	const tabs = [
		{ id: "overview", label: "Overview", icon: Info },
		{ id: "shoots", label: "Shoots", icon: Camera },
		{ id: "deliverables", label: "Deliverables", icon: Image },
		{ id: "tasks", label: "Tasks", icon: CheckSquare },
	];

	return (
		<Tabs
			defaultValue="overview"
			className="h-full flex-1 flex flex-col border-r gap-0"
		>
			<div className="flex-shrink-0 border-b bg-white z-10">
				<div className="px-6 space-y-6 pt-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-6 w-20" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-28" />
						</div>
					</div>

					<div className="rounded-lg bg-muted/40 w-full p-4">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
							<div className="space-y-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="space-y-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="space-y-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
						</div>
					</div>
				</div>

				<div className="px-6">
					<CustomTabsList>
						{tabs.map((tab) => (
							<CustomTabsTrigger key={tab.id} value={tab.id}>
								<tab.icon className="h-4 w-4 mr-2" />
								{tab.label}
							</CustomTabsTrigger>
						))}
					</CustomTabsList>
				</div>
			</div>

			<div className="px-6 pb-8 pt-4">
				<Skeleton className="h-64 w-full" />
			</div>
		</Tabs>
	);
}
