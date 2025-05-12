import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import Tasks from "./tasks";
import { getServerSession } from "@/lib/dal";
import { getTasks } from "@/lib/db/queries";
import { Suspense } from "react";

export default async function TaskPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["tasks"],
		queryFn: () => getTasks(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
				</div>
			</div>
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Tasks />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
