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
		queryKey: ["bookings", "task", "list"],
		queryFn: () => getTasks(session?.session.activeOrganizationId as string),
	});

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-6 md:flex">
			<Suspense fallback={<div>Loading...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Tasks />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
