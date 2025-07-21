import { getServerSession } from "@/lib/dal";
import DeliverableStatusConfigs from "./deliverable-status";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";
import { Protected } from "@/app/restricted-to-roles";

export default async function DeliverableStatusPage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "deliverable_status"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"deliverable_status",
			),
	});

	return (
		<Protected permissions={{ deliverable_status_config: ["read"] }}>
			<div className="space-y-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<DeliverableStatusConfigs />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
