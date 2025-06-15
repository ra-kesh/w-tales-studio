"use client";

import { useQueryState } from "nuqs";
import { useOnboarding } from "@/hooks/use-onboarding";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { GettingStarted } from "./_components/getting-started";
import { Announcements } from "./_components/announcements";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/auth-client";
import { DashboardOverview } from "./_components/dashboard-overview";
import { AllShoots } from "./_components/all-shoots";
import { AllTasks } from "./_components/all-tasks";
import { AllDeliverables } from "./_components/all-deliverables";
import { Camera, CheckCircle2, Package } from "lucide-react";

type TabValue =
	| "home"
	| "getting-started"
	| "announcements"
	| "all-shoots"
	| "all-tasks"
	| "all-deliverables";

const HomeContent = () => {
	const { data: session } = useSession();
	const { data: onboarding, isLoading: onboardingLoading } = useOnboarding();
	const [activeTab, setActiveTab] = useQueryState<TabValue>("tab", {
		defaultValue: "home",
		parse: (value): TabValue => {
			if (
				[
					"home",
					"getting-started",
					"announcements",
					"all-shoots",
					"all-tasks",
					"all-deliverables",
				].includes(value)
			) {
				return value as TabValue;
			}
			return "home";
		},
	});

	// const isOwnerOrAdmin =
	// 	session?.user?.role === "owner" || session?.user?.role === "admin";

	const showGettingStarted = onboarding && !onboarding.onboarded;

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

	useEffect(() => {
		if (
			!onboardingLoading &&
			onboarding &&
			onboarding?.onboarded &&
			activeTab === "getting-started"
		) {
			setActiveTab("home");
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
		{
			value: "all-shoots" as const,
			label: "My Shoots",
			show: true,
			icon: Camera,
		},
		{
			value: "all-tasks" as const,
			label: "My Tasks",
			show: true,
			icon: CheckCircle2,
		},
		{
			value: "all-deliverables" as const,
			label: "My Deliverables",
			show: true,
			icon: Package,
		},
		{
			value: "announcements" as const,
			label: "Announcements",
			show: true,
		},
	].filter((tab) => tab.show);

	const renderTabContent = () => {
		switch (activeTab) {
			case "getting-started":
				return <GettingStarted />;
			case "announcements":
				return <Announcements />;
			case "all-shoots":
				return <AllShoots />;
			case "all-tasks":
				return <AllTasks />;
			case "all-deliverables":
				return <AllDeliverables />;
			default:
				return <DashboardOverview />;
		}
	};

	return (
		<div className="flex flex-col space-y-6">
			<SimpleTabsList className="w-full justify-start gap-6">
				{!onboardingLoading &&
					tabs.map((tab) => (
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
							{tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
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
