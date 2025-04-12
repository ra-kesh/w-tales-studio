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
		{ path: "/settings/organization", label: "Organization" },
		{ path: "/settings/team", label: "Team & Invites" },
		{ path: "/settings/branding", label: "Branding" },
		{ path: "/settings/security", label: "Security" },
		{ path: "/settings/billing", label: "Billing" },
	];

	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage your organization settings and preferences
					</p>
				</div>
			</div>
			<div className="flex flex-col space-y-8">
				<SimpleTabsList className="w-full justify-start gap-6 border-t">
					{tabs.map((tab) => (
						<SimpleTabsTrigger
							key={tab.path}
							className={cn(
								"text-base",
								pathname === tab.path ||
									(tab.path !== "/settings" && pathname.startsWith(tab.path))
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
