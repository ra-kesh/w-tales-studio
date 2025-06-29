import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { auth } from "@/lib/auth";
import { getOnboardingStatus, getUserAssignments } from "@/lib/db/queries";
import { getGreeting } from "@/lib/utils";
import HomeContent from "./home";

const page = async () => {
	const [session, organization] = await Promise.all([
		auth.api.getSession({
			headers: await headers(),
		}),

		auth.api.getFullOrganization({
			headers: await headers(),
		}),
	]).catch((e) => {
		console.log(e);
		throw redirect("/sign-in");
	});

	const activeOrganizationId = session?.session.activeOrganizationId;

	const onboardingStatus = await getOnboardingStatus(
		activeOrganizationId ?? "",
	);

	if (!activeOrganizationId && !onboardingStatus.onboarded) {
		redirect("/getting-started");
	}

	const queryClient = new QueryClient();

	const initialFilters = {
		userId: session?.user.id as string,
		organizationId: activeOrganizationId ?? "",
		page: 1,
		pageSize: 10,
		types: [],
	};

	if (activeOrganizationId) {
		await queryClient.prefetchQuery({
			queryKey: ["assignments", initialFilters],
			queryFn: () => getUserAssignments(initialFilters),
		});
	}

	return (
		<>
			<main>
				<header className="relative isolate ">
					<div
						aria-hidden="true"
						className="absolute inset-0 -z-10 overflow-hidden"
					>
						<div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
							<div
								style={{
									clipPath:
										"polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
								}}
								className="aspect-1154/678 w-[72.125rem] bg-linear-to-br from-[#FF80B5] to-[#9089FC]"
							/>
						</div>
						<div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
					</div>

					<div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
						<div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
							<div className="flex flex-col ">
								<h1 className="text-2xl font-bold tracking-tight mb-2">
									{getGreeting()},{" "}
									{session?.user?.name?.split(" ")[0] || "there"}! 👋
								</h1>

								<p className="text-muted-foreground text-md">
									{!organization?.name
										? "You don't have any active organisation yet"
										: `You are currently on ${organization?.name}`}
								</p>
							</div>
						</div>
					</div>
				</header>
			</main>

			<HydrationBoundary state={dehydrate(queryClient)}>
				<HomeContent />
			</HydrationBoundary>
		</>
	);
};

export default page;
