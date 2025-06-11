"use client";

import * as React from "react";
import {
	ChevronsUpDown,
	GalleryVerticalEnd,
	Plus,
	Loader2,
	AlertCircle,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { Organization } from "@/lib/db/schema";
import type { ActiveOrganization } from "@/types/auth";
import { organization, useListOrganizations } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrganisationSwitcherProps {
	activeOrganization: ActiveOrganization | null;
}

export function OrganisationSwitcher({
	activeOrganization,
}: OrganisationSwitcherProps) {
	const { isMobile } = useSidebar();
	const router = useRouter();

	const {
		data: organizations,
		isPending: isLoadingList,
		error,
	} = useListOrganizations();

	// 1. The state now holds the simpler `Organization` type. This is the key change.
	const [displayOrg, setDisplayOrg] = React.useState<Organization | null>(null);

	const [isSwitching, setIsSwitching] = React.useState(false);

	React.useEffect(() => {
		setDisplayOrg(activeOrganization);
	}, [activeOrganization]);

	const handleSwitchOrganization = async (targetOrg: Organization) => {
		if (targetOrg.id === displayOrg?.id || isSwitching) return;

		const previousOrg = displayOrg;
		setIsSwitching(true);

		setDisplayOrg(targetOrg);

		try {
			await organization.setActive({ organizationId: targetOrg.id });
			router.refresh();
		} catch (err) {
			console.error("Failed to switch organization:", err);
			setDisplayOrg(previousOrg);
		} finally {
			setIsSwitching(false);
		}
	};

	const handleSetPersonal = async () => {
		if (displayOrg === null || isSwitching) return;

		const previousOrg = displayOrg;
		setIsSwitching(true);
		setDisplayOrg(null);

		try {
			await organization.setActive({ organizationId: null });
			router.refresh();
		} catch (err) {
			console.error("Failed to switch to personal account:", err);
			setDisplayOrg(previousOrg);
		} finally {
			setIsSwitching(false);
		}
	};

	const isLoading = isLoadingList || isSwitching;

	// The JSX remains the same, but is now backed by cleaner logic.
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={isLoading}>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<GalleryVerticalEnd className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{displayOrg?.name || "Personal"}
								</span>
								<span className="truncate text-xs">studio</span>
							</div>
							{isLoading ? (
								<Loader2 className="ml-auto size-4 animate-spin" />
							) : (
								<ChevronsUpDown className="ml-auto size-4" />
							)}
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Switch Team
						</DropdownMenuLabel>

						{isLoadingList ? (
							<DropdownMenuItem disabled>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Loading teams...
							</DropdownMenuItem>
						) : error ? (
							<DropdownMenuItem disabled>
								<AlertCircle className="mr-2 size-4 text-destructive" />
								Failed to load teams
							</DropdownMenuItem>
						) : (
							<>
								<DropdownMenuItem
									className="py-1"
									onClick={handleSetPersonal}
									disabled={isSwitching}
								>
									<p className="text-sm">Personal Account</p>
								</DropdownMenuItem>

								{organizations?.map((org) => (
									<DropdownMenuItem
										className="py-1"
										key={org.id}
										onClick={() => handleSwitchOrganization(org)}
										disabled={isSwitching}
									>
										<p
											className={cn(
												"text-sm",
												org.id === displayOrg?.id && "font-semibold",
											)}
										>
											{org.name}
										</p>
									</DropdownMenuItem>
								))}
							</>
						)}

						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="gap-2 p-2"
							onSelect={() => console.log("TODO: Add organization")}
						>
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Plus className="size-4" />
							</div>
							<div className="text-muted-foreground font-medium">
								Add Organisation
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
