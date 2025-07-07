"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimpleTabsList, SimpleTabsTrigger } from "@/components/ui/tabs";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
	children?: React.ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
	// const { data: session } = useSession();

	const pathname = usePathname();

	const tabs = [
		{ path: "/settings/profile", label: "Profile" },
		{ path: "/settings/organization", label: "Organization" },
		{ path: "/settings/invites", label: "Invites" },
	];

	// const { data: activeOrganization } = authClient.useActiveOrganization();

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

// <main>
// <header className="relative isolate ">
// 	<div
// 		aria-hidden="true"
// 		className="absolute inset-0 -z-10 overflow-hidden"
// 	>
// 		<div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
// 			<div
// 				style={{
// 					clipPath:
// 						"polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)",
// 				}}
// 				className="aspect-1154/678 w-[72.125rem] bg-linear-to-br from-[#FF80B5] to-[#9089FC]"
// 			/>
// 		</div>
// 		<div className="absolute inset-x-0 bottom-0 h-px bg-gray-900/5" />
// 	</div>

// 	<div className="mx-auto  px-4 py-8 sm:px-6 lg:px-8">
// 		<div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
// 			<div className="flex items-center gap-x-6">
// 				<Avatar className="rounded-full size-16 ring-1 ring-gray-950/10 p-2">
// 					<AvatarImage
// 						className="object-cover w-full h-full rounded-full"
// 						src={activeOrganization?.logo || undefined}
// 					/>
// 					<AvatarFallback className="rounded-full">
// 						{activeOrganization?.name?.charAt(0) || undefined}
// 					</AvatarFallback>
// 				</Avatar>

// 				<h1>
// 					<div className="text-sm/6 text-gray-500">Studio</div>
// 					<div className="mt-1 text-base font-semibold text-gray-900">
// 						{activeOrganization ? (
// 							<p>{activeOrganization.name}</p>
// 						) : (
// 							<p>Organisation Not Available </p>
// 						)}
// 					</div>
// 				</h1>
// 			</div>
// 			<div className="flex items-center gap-x-4">
// 				<Button
// 					variant={"link"}
// 					type="button"
// 					className="font-semibold cursor-pointer"
// 					onClick={router.back}
// 				>
// 					Back
// 				</Button>

// 				<Link
// 					href={{
// 						pathname: "/bookings/add",
// 						query: { tab: "details" },
// 					}}
// 					prefetch={true}
// 				>
// 					<Button
// 						size="sm"
// 						className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
// 					>
// 						New Booking
// 					</Button>
// 				</Link>
// 			</div>
// 		</div>
// 	</div>
// </header>
// </main>
