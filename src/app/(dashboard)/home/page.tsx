import React, { Suspense } from "react";
import HomeContent from "./home";
import { getGreeting } from "@/lib/utils";
import { getServerSession } from "@/lib/dal";

const page = async () => {
	const { session } = await getServerSession();

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-6  md:flex">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight mb-2">
					{getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}! 👋
				</h1>
				<p className="text-muted-foreground text-md">
					Here's what needs your attention today.
				</p>
			</div>
			<HomeContent />
		</div>
	);
};

export default page;
