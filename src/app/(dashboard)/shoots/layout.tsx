import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	getMinimalBookings,
	getShoots,
	getShootsStats,
	type ShootStats as ShootsStatsType,
} from "@/lib/db/queries";
import { ShootStatsContainer } from "./_components/shoot-stats-container";

const ShootLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	let initialShootsStats: ShootsStatsType;

	if (userOrganizationId) {
		initialShootsStats = await getShootsStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["shoots", "stats", userOrganizationId],
			queryFn: () => getShootsStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialShootsStats = {
			totalShoots: 0,
			upcomingShoots: 0,
			pastShoots: 0,
			unstaffedUpcomingShoots: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "shoot", "list", ""],
		queryFn: () => getShoots(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<Protected permissions={{ shoot: ["read"] }}>
			<div>
				<ShootStatsContainer
					initialStats={initialShootsStats}
					userOrganizationId={userOrganizationId}
				/>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default ShootLayout;
