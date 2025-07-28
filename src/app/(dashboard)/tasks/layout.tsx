import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	type BookingStats as BookingStatsType,
	getConfigs,
	getMinimalBookings,
	getMinimalDeliverables,
	getTasks,
	getTasksStats,
	type ShootStats as ShootsStatsType,
	type TaskStats as TasksStatsType,
} from "@/lib/db/queries";
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
		queryKey: ["bookings", "task", "list", ""],
		queryFn: () => getTasks(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	// await queryClient.prefetchQuery({
	//   queryKey: ["bookings", "deliverables", "minimal"],
	//   queryFn: () =>
	//     getMinimalDeliverables(session?.session.activeOrganizationId as string),
	// });

	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_status"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_status",
			),
	});

	await queryClient.prefetchQuery({
		queryKey: ["configurations", "task_priority"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"task_priority",
			),
	});

	return (
		<Protected permissions={{ task: ["read"] }}>
			<div>
				<TasksStats stats={tasksStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default TaskLayout;
