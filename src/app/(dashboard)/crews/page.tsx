import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import { getCrews } from "@/lib/db/queries";
import { Crews } from "./crews";

export default async function CrewsPage() {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["crews"],
		queryFn: () => getCrews(session?.session.activeOrganizationId as string),
	});

	return (
		<Protected permissions={{ crew: ["read"] }}>
			<div className="h-full flex-1 flex flex-col p-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Crews />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
