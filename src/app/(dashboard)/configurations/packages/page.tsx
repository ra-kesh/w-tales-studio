import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { Protected } from "@/app/restricted-to-roles";
import { getServerSession } from "@/lib/dal";
import { getConfigs } from "@/lib/db/queries";
import PackageConfigs from "./package";

export default async function PackagePage() {
	const { session } = await getServerSession();
	const queryClient = new QueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["configurations", "package_type"],
		queryFn: () =>
			getConfigs(
				session?.session.activeOrganizationId as string,
				"package_type",
			),
	});

	return (
		<Protected permissions={{ package_type_config: ["read"] }}>
			<div className="space-y-6">
				<HydrationBoundary state={dehydrate(queryClient)}>
					<PackageConfigs />
				</HydrationBoundary>
			</div>
		</Protected>
	);
}
