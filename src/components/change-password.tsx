import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { PasswordInput } from "./ui/password-input";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { Loader2 } from "lucide-react";

export function ChangePassword() {
	const [currentPassword, setCurrentPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2 z-10" variant="outline" size="sm">
					<span className="text-sm text-muted-foreground">Change Password</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] w-11/12">
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>Change your password</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Label htmlFor="current-password">Current Password</Label>
					<PasswordInput
						id="current-password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						autoComplete="new-password"
						placeholder="Password"
					/>
					<Label htmlFor="new-password">New Password</Label>
					<PasswordInput
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						autoComplete="new-password"
						placeholder="New Password"
					/>
					<Label htmlFor="password">Confirm Password</Label>
					<PasswordInput
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						autoComplete="new-password"
						placeholder="Confirm Password"
					/>
					<div className="flex gap-2 items-center">
						<Checkbox
							onCheckedChange={(checked) =>
								checked ? setSignOutDevices(true) : setSignOutDevices(false)
							}
						/>
						<p className="text-sm">Sign out from other devices</p>
					</div>
				</div>
				<DialogFooter>
					<Button
						onClick={async () => {
							if (newPassword !== confirmPassword) {
								toast.error("Passwords do not match");
								return;
							}
							if (newPassword.length < 8) {
								toast.error("Password must be at least 8 characters");
								return;
							}
							setLoading(true);
							const res = await authClient.changePassword({
								newPassword: newPassword,
								currentPassword: currentPassword,
								revokeOtherSessions: signOutDevices,
							});
							setLoading(false);
							if (res.error) {
								toast.error(
									res.error.message ||
										"Couldn't change your password! Make sure it's correct",
								);
							} else {
								setOpen(false);
								toast.success("Password changed successfully");
								setCurrentPassword("");
								setNewPassword("");
								setConfirmPassword("");
							}
						}}
					>
						{loading ? (
							<Loader2 size={15} className="animate-spin" />
						) : (
							"Change Password"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
