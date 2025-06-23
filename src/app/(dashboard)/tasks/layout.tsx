import { getServerSession } from "@/lib/dal";
import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import {
	getMinimalBookings,
	type ShootStats as ShootsStatsType,
	type BookingStats as BookingStatsType,
	getTasksStats,
	type TaskStats as TasksStatsType,
	getTasks,
} from "@/lib/db/queries";
import { Suspense } from "react";
import { TasksStats } from "./_components/taks-shoot";

const TaskLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	let tasksStats: TasksStatsType;

	if (userOrganizationId) {
		tasksStats = await getTasksStats(userOrganizationId);
	} else {
		tasksStats = {
			totalTasks: 0,
			inProgressTasks: 0,
			todoTasks: 0,
			overdueTasks: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "task", "list"],
		queryFn: () => getTasks(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<TasksStats stats={tasksStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default TaskLayout;
