"use client";

import { useQueryState } from "nuqs";
import { useSession } from "@/lib/auth/auth-client";
import { useOnboarding } from "@/hooks/use-onboarding";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { GettingStarted } from "./_components/getting-started";
import { DashboardOverview } from "./_components/dashboard-overview";
import { Announcements } from "./_components/announcements";
import { RecentUpdates } from "./_components/recent-updates";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type TabValue = "home" | "getting-started" | "announcements" | "recent-updates";

const HomeContent = () => {
	const { data: session } = useSession();
	const { data: onboarding, isLoading: onboardingLoading } = useOnboarding();
	const [activeTab, setActiveTab] = useQueryState<TabValue>("tab", {
		defaultValue: "home",
		parse: (value): TabValue => {
			if (
				["home", "getting-started", "announcements", "recent-updates"].includes(
					value,
				)
			) {
				return value as TabValue;
			}
			return "home";
		},
	});

	// const isOwnerOrAdmin =
	// 	session?.user?.role === "owner" || session?.user?.role === "admin";

	const showGettingStarted = onboarding && !onboarding.onboarded;

	// Auto-switch to getting-started tab if organization is not created
	useEffect(() => {
		if (
			!onboardingLoading &&
			onboarding &&
			!onboarding.organizationCreated &&
			activeTab === "home"
		) {
			setActiveTab("getting-started");
		}
	}, [onboarding, onboardingLoading, activeTab, setActiveTab]);

	const tabs = [
		{
			value: "home" as const,
			label: "Overview",
			show: true,
		},
		{
			value: "getting-started" as const,
			label: "Getting Started",
			show: showGettingStarted,
			highlight: true,
		},
		// {
		// 	value: "announcements" as const,
		// 	label: "Announcements",
		// 	show: true,
		// },
		// {
		// 	value: "recent-updates" as const,
		// 	label: "Recent Updates",
		// 	show: true,
		// },
	].filter((tab) => tab.show);

	const renderTabContent = () => {
		switch (activeTab) {
			case "getting-started":
				return <GettingStarted />;
			// case "announcements":
			// 	return <Announcements />;
			// case "recent-updates":
			// 	return <RecentUpdates />;
			default:
				return <DashboardOverview />;
		}
	};

	return (
		<div className="flex flex-col space-y-8">
			<SimpleTabsList className="w-full justify-start gap-6">
				{tabs.map((tab) => (
					<SimpleTabsTrigger
						key={tab.value}
						className={cn(
							"p-2 border-b-2 border-transparent transition-colors",
							activeTab === tab.value
								? "border-primary text-primary font-medium"
								: "hover:text-foreground",
							tab.highlight && "relative",
						)}
						onClick={() => setActiveTab(tab.value)}
					>
						{tab.label}
						{tab.highlight && (
							<div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
						)}
					</SimpleTabsTrigger>
				))}
			</SimpleTabsList>

			<div className="min-h-[400px]">{renderTabContent()}</div>
		</div>
	);
};

export default HomeContent;
