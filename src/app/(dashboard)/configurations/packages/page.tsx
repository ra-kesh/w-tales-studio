import { getServerSession } from "@/lib/dal";
import PackageConfigs from "./package";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getConfigs } from "@/lib/db/queries";

export default async function PackagePage() {
  const { session } = await getServerSession();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["configurations", "package_type"],
    queryFn: () =>
      getConfigs(
        session?.session.activeOrganizationId as string,
        "package_type"
      ),
  });

  return (
    <div className="space-y-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PackageConfigs />
      </HydrationBoundary>
    </div>
  );
}
