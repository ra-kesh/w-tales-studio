"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, StopCircle, LogOut } from "lucide-react";
import type { Session } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient, signOut, useSession } from "@/lib/auth/auth-client";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { UAParser } from "ua-parser-js";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChangePassword } from "@/components/change-password";

export function UserProfile(props: {
	session: Session | null;
	activeSessions: Session["session"][];
}) {
	const { data, isPending } = useSession();
	const session = data || props.session;

	const [isTerminating, setIsTerminating] = useState<string>();
	const [emailVerificationPending, setEmailVerificationPending] =
		useState<boolean>(false);

	const [isSignOut, setIsSignOut] = useState<boolean>(false);

	console.log(props?.activeSessions);

	const router = useRouter();

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div className="px-4 sm:px-0">
					<h3 className="text-base/7 font-semibold text-gray-900">
						User Profile
					</h3>
					<p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
						Details of the user profile currently active.
					</p>
				</div>
				<div>{<EditUserDialog />}</div>
			</div>
			<div className="mt-6 border-t border-gray-100">
				<dl className="divide-y divide-gray-100">
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900 lg:flex lg:items-center">
							Profile Picture
						</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							<Avatar className="rounded-full h-10 w-10">
								<AvatarImage
									src={session?.user.image || undefined}
									alt="Avatar"
									className="object-cover"
								/>
								<AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
							</Avatar>
						</dd>
					</div>
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">User Name</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							{session?.user.name}
						</dd>
					</div>
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">User Email</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							{session?.user.email}
						</dd>
					</div>
				</dl>
			</div>

			<CardFooter className="gap-2 place-content-end items-center">
				<ChangePassword />
				{session?.session.impersonatedBy ? (
					<Button
						className="gap-2 z-10"
						variant="secondary"
						onClick={async () => {
							setIsSignOut(true);
							await authClient.admin.stopImpersonating();
							setIsSignOut(false);
							toast.info("Impersonation stopped successfully");
							router.push("/admin");
						}}
						disabled={isSignOut}
					>
						<span className="text-sm">
							{isSignOut ? (
								<Loader2 size={15} className="animate-spin" />
							) : (
								<div className="flex items-center gap-2">
									<StopCircle size={16} color="red" />
									Stop Impersonation
								</div>
							)}
						</span>
					</Button>
				) : (
					<Button
						className="gap-2 z-10"
						variant="secondary"
						onClick={async () => {
							setIsSignOut(true);
							await signOut({
								fetchOptions: {
									onSuccess() {
										router.push("/");
									},
								},
							});
							setIsSignOut(false);
						}}
						disabled={isSignOut}
					>
						<span className="text-sm">
							{isSignOut ? (
								<Loader2 size={15} className="animate-spin" />
							) : (
								<div className="flex items-center gap-2">
									<LogOut size={16} />
									Sign Out
								</div>
							)}
						</span>
					</Button>
				)}
			</CardFooter>

			<div>
				{session?.user.emailVerified ? null : (
					<Alert>
						<AlertTitle>Verify Your Email Address</AlertTitle>
						<AlertDescription className="text-muted-foreground">
							Please verify your email address. Check your inbox for the
							verification email. If you haven't received the email, click the
							button below to resend.
						</AlertDescription>
						<div>
							<Button
								size="sm"
								variant="secondary"
								className="mt-2"
								onClick={async () => {
									await authClient.sendVerificationEmail(
										{
											email: session?.user.email || "",
											callbackURL: "/home",
										},
										{
											onRequest(context) {
												setEmailVerificationPending(true);
											},
											onError(context) {
												toast.error(context.error.message);
												setEmailVerificationPending(false);
											},
											onSuccess() {
												toast.success("Verification email sent successfully");
												setEmailVerificationPending(false);
											},
										},
									);
								}}
							>
								{emailVerificationPending ? (
									<Loader2 size={15} className="animate-spin" />
								) : (
									"Resend Verification Email"
								)}
							</Button>
						</div>
					</Alert>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Active Sessions</CardTitle>
					<CardDescription>
						Manage your active sessions across different devices
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Device</TableHead>
								<TableHead>OS</TableHead>
								<TableHead>Browser</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{props.activeSessions.map((session) => (
								<TableRow key={session.id}>
									<TableCell>
										{new UAParser(session.userAgent || "").getDevice().type ===
										"mobile"
											? "Mobile"
											: "Laptop/Desktop"}
									</TableCell>
									<TableCell>
										{new UAParser(session.userAgent || "").getOS().name}
									</TableCell>
									<TableCell>
										{new UAParser(session.userAgent || "").getBrowser().name}
									</TableCell>

									<TableCell>
										<Badge
											variant={
												session.id === props.session?.session.id
													? "default"
													: "secondary"
											}
										>
											{session.id === props.session?.session.id
												? "Current"
												: "Active"}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="secondary"
											type="button"
											className="  cursor-pointer text-x"
											onClick={async () => {
												setIsTerminating(session.id);
												const res = await authClient.revokeSession({
													token: session.token,
												});

												if (res.error) {
													toast.error(res.error.message);
												} else {
													toast.success("Session terminated successfully");
												}
												router.refresh();
												setIsTerminating(undefined);
											}}
										>
											{isTerminating === session.id ? (
												<Loader2 size={15} className="animate-spin" />
											) : session.id === props.session?.session.id ? (
												"Sign Out"
											) : (
												"Terminate"
											)}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
