"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

interface SettingsLayoutProps {
	children?: React.ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
	const pathname = usePathname();

	const tabs = [
		{ path: "/configurations/packages", label: "Package Types" },
		{ path: "/configurations/deliverables", label: "Deliverables" },
		{ path: "/configurations/booking", label: "Booking Types" },
	];

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 pt-0 md:flex ">
			<div className="flex flex-col space-y-4">
				<SimpleTabsList className="w-full justify-start gap-6">
					{tabs.map((tab) => (
						<SimpleTabsTrigger
							key={tab.path}
							className={cn(
								"text-center text-base",
								pathname === tab.path ||
									(tab.path !== "/configurations" &&
										pathname.startsWith(tab.path))
									? "text-foreground shadow-[inset_0_-1px_0_0,0_1px_0_0]"
									: "text-muted-foreground",
							)}
						>
							<Link href={tab.path} className="w-full py-3">
								{tab.label}
							</Link>
						</SimpleTabsTrigger>
					))}
				</SimpleTabsList>
				<Suspense>{children}</Suspense>
			</div>
		</div>
	);
};

export default SettingsLayout;
