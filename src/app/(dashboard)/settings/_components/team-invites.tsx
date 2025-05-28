"use client";

import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
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
import InviteMemberDialog from "@/components/invite-member-dialog";

const inviteSchema = z.object({
	email: z.string().email(),
	role: z.enum(["photographer", "cinematographer", "editor", "assistant"]),
});

const mockInvites = [
	{
		id: 1,
		email: "sarah@gmail.com",
		role: "photographer",
		status: "pending",
		sent: "2024-01-15",
	},
	{
		id: 2,
		email: "john@gmail.com",
		role: "editor",
		status: "accepted",
		sent: "2024-01-14",
	},
	{
		id: 3,
		email: "mike@gmail.com",
		role: "cinematographer",
		status: "expired",
		sent: "2024-01-10",
	},
];

export function TeamInvites() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex justify-between items-center">
					<div>
						<CardTitle>Pending Invitations</CardTitle>
						<CardDescription>Manage and track sent invitations</CardDescription>
					</div>
					<div>
						<InviteMemberDialog />
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Sent Date</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{mockInvites.map((invite) => (
								<TableRow key={invite.id}>
									<TableCell>{invite.email}</TableCell>
									<TableCell className="capitalize">{invite.role}</TableCell>
									<TableCell>
										<Badge
											variant={
												invite.status === "accepted"
													? "default"
													: invite.status === "pending"
														? "secondary"
														: "destructive"
											}
										>
											{invite.status}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(invite.sent).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right">
										{invite.status === "pending" && (
											<Button variant="ghost" size="sm">
												Resend
											</Button>
										)}
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
