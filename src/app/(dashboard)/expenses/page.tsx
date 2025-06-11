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
		<div className="h-full flex-1 flex flex-col p-6">
			<Suspense fallback={<div>Loadding...</div>}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Expenses />
				</HydrationBoundary>
			</Suspense>
		</div>
	);
}
