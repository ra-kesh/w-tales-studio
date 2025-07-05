"use client";

import {
	AlertCircle,
	ChevronsUpDown,
	GalleryVerticalEnd,
	Loader2,
	Plus,
} from "lucide-react";
import * as React from "react";

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
import { organization, useListOrganizations } from "@/lib/auth/auth-client";
import type { Organization } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { ActiveOrganization, Session } from "@/types/auth";

interface OrganisationSwitcherProps {
	session: Session | null;
	activeOrganization: ActiveOrganization | null;
}

export function OrganisationSwitcher({
	session,
	activeOrganization,
}: OrganisationSwitcherProps) {
	const { isMobile } = useSidebar();

	const {
		data: organizations,
		isPending: isLoadingList,
		error,
	} = useListOrganizations();

	const [displayOrg, setDisplayOrg] = React.useState<Organization | null>(null);

	const [isSwitching, setIsSwitching] = React.useState(false);

	React.useEffect(() => {
		setDisplayOrg(
			activeOrganization
				? {
						...activeOrganization,
						logo: activeOrganization.logo ?? null,
						metadata: activeOrganization.metadata ?? null,
					}
				: null,
		);
	}, [activeOrganization]);

	const handleSwitchOrganization = async (targetOrg: Organization) => {
		if (targetOrg.id === displayOrg?.id || isSwitching) return;

		const previousOrg = displayOrg;
		setIsSwitching(true);

		setDisplayOrg(targetOrg);

		try {
			await organization.setActive({ organizationId: targetOrg.id });
			window.location.reload();
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
			window.location.reload();
		} catch (err) {
			console.error("Failed to switch to personal account:", err);
			setDisplayOrg(previousOrg);
		} finally {
			setIsSwitching(false);
		}
	};

	const isLoading = isLoadingList || isSwitching;

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
								<span className="truncate text-xs">{session?.roles[0]}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
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
										onClick={() =>
											handleSwitchOrganization({
												...org,
												logo: org.logo ?? null,
												metadata: org.metadata ?? null,
											})
										}
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
