import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { getServerSession } from "@/lib/dal";
import {
	type BookingStats as BookingStatsType,
	getMinimalBookings,
	getShoots,
	getShootsStats,
	type ShootStats as ShootsStatsType,
} from "@/lib/db/queries";
import { ShootsStats } from "./_components/shoot-stats";

const ShootLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	let shootsStats: ShootsStatsType;

	if (userOrganizationId) {
		shootsStats = await getShootsStats(userOrganizationId);
	} else {
		shootsStats = {
			totalShoots: 0,
			upcomingShoots: 0,
			pastShoots: 0,
			unstaffedUpcomingShoots: 0,
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
		queryKey: ["bookings", "shoot", "list", ""],
		queryFn: () => getShoots(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<ShootsStats stats={shootsStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default ShootLayout;
