import { getServerSession } from "@/lib/dal";
import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import {
	getMinimalBookings,
	getShoots,
	getShootsStats,
	type ExpenseStats as ExpenseStatsType,
	type BookingStats as BookingStatsType,
	getExpenses,
	getExpenseStats,
	getConfigs,
} from "@/lib/db/queries";
import { Suspense } from "react";
import { ExpensesStats } from "./_components/expense-stats";

const ExpenseLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	let expenseStats: ExpenseStatsType;

	if (userOrganizationId) {
		expenseStats = await getExpenseStats(userOrganizationId);
	} else {
		expenseStats = {
			foodAndDrink: 0,
			travelAndAccommodation: 0,
			equipment: 0,
			miscellaneous: 0,
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
		queryKey: ["expenses"],
		queryFn: () => getExpenses(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["bookings", "list", "minimal"],
		queryFn: () =>
			getMinimalBookings(session?.session.activeOrganizationId as string),
	});

	await queryClient.prefetchQuery({
		queryKey: ["configurations", "expense_category"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"expense_category",
			),
	});

	return (
		<div>
			<Suspense fallback={<div>Loading...</div>}>
				<ExpensesStats stats={expenseStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</Suspense>
		</div>
	);
};

export default ExpenseLayout;
