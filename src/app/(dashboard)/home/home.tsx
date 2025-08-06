"use client";

import { Camera, CheckCircle2, Package } from "lucide-react";
import { useQueryState } from "nuqs";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AllDeliverables } from "./_components/all-deliverables";
import { AllShoots } from "./_components/all-shoots";
import { AllTasks } from "./_components/all-tasks";
import { Announcements } from "./_components/announcements";
import { DashboardOverview } from "./_components/dashboard-overview";

type TabValue =
	| "home"
	| "announcements"
	| "all-shoots"
	| "all-tasks"
	| "all-deliverables";

const HomeContent = () => {
	const [activeTab, setActiveTab] = useQueryState<TabValue>("tab", {
		defaultValue: "home",
		parse: (value): TabValue => {
			if (
				[
					"home",
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

	const tabs = [
		{
			value: "home" as const,
			label: "Overview",
			show: true,
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
		// {
		// 	value: "announcements" as const,
		// 	label: "Announcements",
		// 	show: true,
		// },
	].filter((tab) => tab.show);

	const renderTabContent = () => {
		switch (activeTab) {
			// case "announcements":
			// 	return <Announcements />;
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
		<div className="flex flex-col  mx-auto  px-4 py-8 sm:px-6 lg:px-8 lg:mx-0 lg:max-w-none">
			<div className="mx-auto max-w-2xl space-y-6  lg:mx-0 lg:max-w-none ">
				<SimpleTabsList className="w-full justify-start gap-6">
					{tabs.map((tab) => (
						<SimpleTabsTrigger
							key={tab.value}
							className={cn(
								"group flex items-center p-2 border-b-2 border-transparent transition-colors",
								activeTab === tab.value
									? "border-indigo-500 hover:border-indigo-500 text-indigo-600 hover:text-indigo-600 font-medium"
									: "text-gray-500 hover:border-gray-300 hover:text-gray-700",
							)}
							onClick={() => setActiveTab(tab.value)}
						>
							{tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
							{tab.label}
						</SimpleTabsTrigger>
					))}
				</SimpleTabsList>

				<div className="min-h-[400px]">{renderTabContent()}</div>
			</div>
		</div>
	);
};

export default HomeContent;
