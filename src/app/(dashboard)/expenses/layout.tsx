import {
	dehydrate,
	HydrationBoundary,
	MutationCache,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import {
	type ExpenseStats as ExpenseStatsType,
	getConfigs,
	getExpenseStats,
	getExpenses,
	getMinimalBookings,
} from "@/lib/db/queries";
import { ExpenseStatsContainer } from "./_components/expense-stats-container";

const ExpenseLayout = async ({ children }: { children: React.ReactNode }) => {
	const { session } = await getServerSession();

	const userOrganizationId = session?.session.activeOrganizationId as string;

	const queryClient = new QueryClient({
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});

	let initialExpenseStats: ExpenseStatsType;

	if (userOrganizationId) {
		initialExpenseStats = await getExpenseStats(userOrganizationId);

		await queryClient.prefetchQuery({
			queryKey: ["expenses", "stats", userOrganizationId],
			queryFn: () => getExpenseStats(userOrganizationId),
			staleTime: 30000,
		});
	} else {
		initialExpenseStats = {
			foodAndDrink: 0,
			travelAndAccommodation: 0,
			equipment: 0,
			miscellaneous: 0,
		};

		console.warn(
			"User organization ID not found during booking layout prerender. Using default stats.",
		);
	}

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
				<ExpenseStatsContainer
					initialStats={initialExpenseStats}
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

export default ExpenseLayout;
