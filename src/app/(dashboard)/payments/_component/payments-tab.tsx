"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function PaymentTabs() {
	const pathname = usePathname();

	const tabs = [
		{ path: "/payments/received", label: "Received Payments" },
		{ path: "/payments/scheduled", label: "Scheduled Payments" },
	];

	return (
		<SimpleTabsList className="w-full justify-start gap-6">
			{tabs.map((tab) => (
				<SimpleTabsTrigger
					key={tab.path}
					className={cn(
						"group flex items-center p-2 border-b-2 border-transparent transition-colors",
						pathname === tab.path ||
							(tab.path !== "/payments" && pathname.startsWith(tab.path))
							? "border-indigo-500 hover:border-indigo-500 text-indigo-600 hover:text-indigo-600 font-medium"
							: "text-gray-500 hover:border-gray-300 hover:text-gray-700",
					)}
				>
					<Link prefetch={true} href={tab.path} className="w-full py-2">
						{tab.label}
					</Link>
				</SimpleTabsTrigger>
			))}
		</SimpleTabsList>
	);
}
