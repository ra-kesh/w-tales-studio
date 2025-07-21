"use client";

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	PlusCircle,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
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
import { authClient, signOut, useSession } from "@/lib/auth/auth-client";
import type { Session } from "@/types/auth";

export function NavUser({ sessions }: { sessions: Session[] }) {
	const { isMobile } = useSidebar();

	const { data: currentUser } = useSession();

	const router = useRouter();

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/sign-in");
				},
			},
		});
	}

	async function handleSwitchAccount(sessionToken: string) {
		await authClient.multiSession.setActive({
			sessionToken,
		});
		window.location.reload();
	}

	function handleAddAccount() {
		router.push("/sign-in");
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 ring-2 ring-primary/20">
								<AvatarImage
									src={currentUser?.user.image || undefined}
									alt={currentUser?.user.name}
									className="object-cover"
								/>
								<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
									{currentUser?.user.name?.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{currentUser?.user.name}
								</span>
								<span className="truncate text-xs">
									{currentUser?.user.email}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 ring-2 ring-primary/20">
									<AvatarImage
										src={currentUser?.user.image || undefined}
										alt={currentUser?.user.name}
										className="object-cover"
									/>
									<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
										{currentUser?.user.name?.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{currentUser?.user.name}
									</span>
									<span className="truncate text-xs">
										{currentUser?.user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{sessions.filter((s) => s.user.id !== currentUser?.user.id)
								.length > 0 && (
								<>
									<DropdownMenuLabel className="text-muted-foreground text-xs">
										Switch Account
									</DropdownMenuLabel>
									<DropdownMenuLabel className="p-0 font-normal">
										<div className="space-y-1">
											{sessions
												.filter((s) => s.user.id !== currentUser?.user.id)
												.map((session, i) => (
													<div
														key={i}
														onClick={() =>
															handleSwitchAccount(session.session.token)
														}
														className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer"
													>
														<Avatar className="h-8 w-8 ring-1 ring-border">
															<AvatarImage
																src={session.user.image || undefined}
																alt={session.user.name}
																className="object-cover"
															/>
															<AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm">
																{session.user.name?.charAt(0).toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div className="flex-1 text-left min-w-0">
															<p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
																{session.user.name}
															</p>
															<p className="text-sm text-muted-foreground truncate">
																{session.user.email}
															</p>
														</div>
													</div>
												))}
										</div>
									</DropdownMenuLabel>
								</>
							)}
							<DropdownMenuItem
								onClick={handleAddAccount}
								className="p-0 font-normal"
							>
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm cursor-pointer">
									<div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
										<PlusCircle className="h-4 w-4 text-primary" />
									</div>
									<div className="flex-1 text-left">
										<p className="text-sm text-foreground group-hover:text-primary transition-colors">
											Add Account
										</p>
										<p className="text-xs text-muted-foreground">
											Sign in with another account
										</p>
									</div>
								</div>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleSignOut}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
