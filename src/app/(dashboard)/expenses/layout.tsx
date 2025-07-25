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
	type ExpenseStats as ExpenseStatsType,
	getConfigs,
	getExpenseStats,
	getExpenses,
	getMinimalBookings,
	getShoots,
	getShootsStats,
} from "@/lib/db/queries";
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
		queryKey: ["expenses", ""],
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
		<Protected permissions={{ expense: ["read"] }}>
			<div>
				<ExpensesStats stats={expenseStats} />
				<HydrationBoundary state={dehydrate(queryClient)}>
					<div className="flex flex-col  mx-auto  px-4  sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
						{children}
					</div>
				</HydrationBoundary>
			</div>
		</Protected>
	);
};

export default ExpenseLayout;
