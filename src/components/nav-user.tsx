"use client";

import { LogOut, ChevronsUpDown, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { authClient, signOut, useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import type { Session } from "@/types/auth";

export function NavUser({ sessions }: { sessions: Session[] }) {
	const { data: currentUser } = useSession();
	const [open, setOpen] = useState(false);
	const router = useRouter();

	async function handleSignOut() {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/sign-in");
				},
			},
		});
		setOpen(false);
	}

	async function handleSwitchAccount(sessionToken: string) {
		await authClient.multiSession.setActive({
			sessionToken,
		});
		setOpen(false);
	}

	function handleAddAccount() {
		router.push("/sign-in");
		setOpen(false);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-10 w-auto px-4 hover:bg-accent/50 transition-all duration-200 rounded-md border border-transparent hover:border-border/50"
				>
					<div className="flex items-center gap-3">
						<Avatar className="h-7 w-7 ring-2 ring-background shadow-sm">
							<AvatarImage
								src={currentUser?.user.image || undefined}
								alt={currentUser?.user.name}
								className="object-cover"
							/>
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
								{currentUser?.user.name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-start min-w-0">
							<span className="text-sm font-medium text-foreground truncate max-w-[120px]">
								{currentUser?.user.name}
							</span>
							<span className="text-xs text-muted-foreground truncate max-w-[120px]">
								{currentUser?.user.email}
							</span>
						</div>
						<ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0 shadow-xl border-0 bg-background/95 backdrop-blur-md rounded-md"
				align="end"
				sideOffset={8}
			>
				<div className="p-1">
					{/* Current User Section */}
					<div className="p-4 border-b border-border/50">
						<div className="flex items-center gap-3">
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
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h4 className="font-semibold text-foreground truncate">
										{currentUser?.user.name}
									</h4>
									<div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
										<div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
										<span className="text-xs font-medium text-green-700 dark:text-green-400">
											Active
										</span>
									</div>
								</div>
								<p className="text-sm text-muted-foreground truncate">
									{currentUser?.user.email}
								</p>
							</div>
						</div>
					</div>

					{/* Other Sessions */}
					{sessions.filter((s) => s.user.id !== currentUser?.user.id).length >
						0 && (
						<div className="p-1">
							<h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1 mb-1">
								Switch Account
							</h5>
							<div className="space-y-1">
								{sessions
									.filter((s) => s.user.id !== currentUser?.user.id)
									.map((session, i) => (
										<button
											type="button"
											key={i}
											onClick={() => handleSwitchAccount(session.session.token)}
											className="w-full flex items-center gap-3 py-1 px-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
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
										</button>
									))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="p-2 border-t border-border/50">
						<div className="space-y-1">
							<button
								type="button"
								onClick={handleAddAccount}
								className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-all duration-200 group"
							>
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
							</button>

							<button
								type="button"
								onClick={handleSignOut}
								className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-destructive/10 transition-all duration-200 group"
							>
								<div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
									<LogOut className="h-4 w-4 text-destructive" />
								</div>
								<div className="flex-1 text-left">
									<p className="text-sm text-foreground group-hover:text-destructive transition-colors">
										Sign Out
									</p>
									<p className="text-xs text-muted-foreground">
										Sign out of your account
									</p>
								</div>
							</button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
