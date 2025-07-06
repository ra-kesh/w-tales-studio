"use client";

import {
	AlertCircle,
	Building2Icon,
	ChevronsUpDown,
	GalleryVerticalEnd,
	Loader2,
	MailPlusIcon,
	Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
	authClient,
	organization,
	useListOrganizations,
	useSession,
} from "@/lib/auth/auth-client";
import type { Organization } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import type { ActiveOrganization, Session } from "@/types/auth";
import InviteMemberDialog from "./invite-member-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

	const router = useRouter();

	const hasAccess = authClient.organization.checkRolePermission({
		role: session?.roles.join(","), // Pass the roles array directly.
		permissions: {
			studio: ["view_studio"],
		},
	});

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={isLoading}>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className=" text-sidebar-primary-foreground flex aspect-auto size-8 items-center justify-center rounded-full">
								<Avatar className="size-8 ring-1 ring-gray-950/10 shadow-sm">
									<AvatarImage
										src={displayOrg?.logo || undefined}
										alt={displayOrg?.name}
										className="object-cover"
									/>
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
										{displayOrg?.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
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
							Studio Actions
						</DropdownMenuLabel>

						{/* {isLoadingList ? (
							<DropdownMenuItem disabled>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Loading your studios
							</DropdownMenuItem>
						) : error ? (
							<DropdownMenuItem disabled>
								<AlertCircle className="mr-2 size-4 text-destructive" />
								Failed to load any studio
							</DropdownMenuItem>
						) : (
							<>
								<DropdownMenuItem
									className="py-1"
									onClick={handleSetPersonal}
									disabled={isSwitching}
								>
									<p className="text-sm">Personal Space</p>
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
						)} */}

						{hasAccess ? (
							<>
								<DropdownMenuItem
									className="gap-2 p-2"
									onSelect={() => {
										router.prefetch("/settings/organization");
										router.push("/settings/organization");
									}}
								>
									<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
										<Building2Icon className="size-4" />
									</div>
									<div className="text-foreground font-medium">
										View Studio Details
									</div>
								</DropdownMenuItem>

								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 p-2"
									onSelect={() => {
										router.prefetch("/settings/invites");
										router.push("/settings/invites");
									}}
								>
									<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
										<MailPlusIcon size={4} />
									</div>
									<div className="text-muted-foreground font-medium">
										View Invites
									</div>
								</DropdownMenuItem>
							</>
						) : (
							<DropdownMenuItem
								className="gap-2 p-2"
								// onSelect={() => {
								// 	router.prefetch("/settings/invites");
								// 	router.push("/settings/invites");
								// }}
							>
								{/* <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
									<MailPlusIcon size={4} />
								</div> */}
								<div className="text-muted-foreground font-medium">
									No actions available for you
								</div>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
