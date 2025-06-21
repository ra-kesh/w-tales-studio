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
							<div className="flex flex-col items-center gap-x-6">
								<h1 className="text-2xl font-bold tracking-tight mb-2">
									{getGreeting()},{" "}
									{session?.user?.name?.split(" ")[0] || "there"}! 👋
								</h1>

								<p className="text-muted-foreground text-md">
									Here's what needs your attention today.
								</p>
							</div>
							<div className="flex items-center gap-x-4">
								{/* <Button
									variant={"ghost"}
									type="button"
									className="font-semibold cursor-pointer"
									onClick={router.back}
								>
									Back
								</Button> */}

								{/* <Link
									href={{
										pathname: "/bookings/add",
										query: { tab: "details" },
									}}
									prefetch={true}
								>
									<Button
										size="sm"
										className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
									>
										New Booking
									</Button>
								</Link> */}
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
