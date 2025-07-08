"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { settingsTabs } from "@/data/tab-data";
import { useFilteredTabs } from "@/hooks/use-filtered-tabs";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
	children?: React.ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
	const pathname = usePathname();

	const tabs = useFilteredTabs(settingsTabs);

	return (
		<>
			<div className="hidden h-full flex-1 flex-col space-y-8 p-6 pt-0 md:flex">
				<div className="flex flex-col space-y-8">
					<SimpleTabsList className="w-full justify-start gap-6">
						{tabs.map((tab) => (
							<SimpleTabsTrigger
								key={tab.path}
								className={cn(
									"group flex items-center p-2 border-b-2 border-transparent transition-colors",
									pathname === tab.path ||
										(tab.path !== "/settings" && pathname.startsWith(tab.path))
										? "border-indigo-500 hover:border-indigo-500 text-indigo-600 hover:text-indigo-600 font-medium"
										: "text-gray-500 hover:border-gray-300 hover:text-gray-700",
								)}
							>
								<Link href={tab.path} className="w-full py-2">
									{tab.label}
								</Link>
							</SimpleTabsTrigger>
						))}
					</SimpleTabsList>
					<Suspense>{children}</Suspense>
				</div>
			</div>
		</>
	);
};

export default SettingsLayout;
