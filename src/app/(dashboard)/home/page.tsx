import React from "react";
import HomeContent from "./home";
import { getGreeting } from "@/lib/utils";
import { getServerSession } from "@/lib/dal";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getUserAssignments } from "@/lib/db/queries";

const page = async () => {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	const initialFilters = {
		userId: session?.user.id as string,
		organizationId: session?.session.activeOrganizationId as string,
		page: 1,
		pageSize: 10,
		types: [],
	};

	await queryClient.prefetchQuery({
		queryKey: ["assignments", initialFilters],
		queryFn: () => getUserAssignments(initialFilters),
	});

	return (
		<div className="hidden h-full flex-1 flex-col  p-6  md:flex">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight mb-2">
					{getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}! 👋
				</h1>
				<p className="text-muted-foreground text-md">
					Here's what needs your attention today.
				</p>
			</div>
			<HydrationBoundary state={dehydrate(queryClient)}>
				<HomeContent />
			</HydrationBoundary>
		</div>
	);
};

export default page;
