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
import { MailPlus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { organization } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";
import { set } from "date-fns";

function InviteMemberDialog() {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();

	const router = useRouter();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="w-full gap-2" variant={"default"}>
					<MailPlus size={16} />
					<p>Invite Member</p>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] w-11/12">
				<DialogHeader>
					<DialogTitle>Invite Member</DialogTitle>
					<DialogDescription>
						Invite a member to your organization.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<Label>Email</Label>
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Label>Role</Label>
					<Select value={role} onValueChange={setRole}>
						<SelectTrigger>
							<SelectValue placeholder="Select a role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="admin">Admin</SelectItem>
							<SelectItem value="member">Member</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					{/* <DialogClose> */}
					<Button
						disabled={loading}
						onClick={async () => {
							const invite = organization.inviteMember({
								email: email,
								role: role as "member",
								fetchOptions: {
									throw: true,
									onRequest: () => {
										setLoading(true);
									},
									onSuccess: () => {
										queryClient.invalidateQueries({
											queryKey: ["onboarding"],
										});
										setLoading(false);
										setOpen(false);
										setEmail("");
										setRole("member");
										queryClient.refetchQueries({
											queryKey: ["onboarding"],
										});
										router.refresh();
									},
									// onSuccess: (ctx) => {
									// 	if (optimisticOrg) {
									// 		setOptimisticOrg({
									// 			...optimisticOrg,
									// 			invitations: [
									// 				...(optimisticOrg?.invitations || []),
									// 				ctx.data,
									// 			],
									// 		});
									// 	}
									// },
								},
							});
							toast.promise(invite, {
								loading: "Inviting member...",
								success: "Member invited successfully",
								error: (error) => error.error.message,
							});
						}}
					>
						Invite
					</Button>
					{/* </DialogClose> */}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default InviteMemberDialog;
