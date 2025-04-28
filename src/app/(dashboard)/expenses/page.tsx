import { Expenses } from "./expenses";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getExpenses } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";
import { Suspense } from "react";

export default async function ExpensesPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["expenses"],
		queryFn: () => getExpenses(session?.session.activeOrganizationId as string),
	});
	return (
		<div className="h-full flex-1 flex flex-col p-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
					<p className="text-muted-foreground">
						Track and manage project-related expenses
					</p>
				</div>
			</div>
			<Suspense fallback={<div>Loadding...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Expenses />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
