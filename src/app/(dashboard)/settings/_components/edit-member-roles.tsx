"use client";

import { Loader2, Pencil } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { MultiAsyncSelect } from "@/components/ui/multi-select";
import { authClient } from "@/lib/auth/auth-client";

const assignableRoles = [
	{ value: "admin", label: "Admin" },
	{ value: "manager", label: "Manager" },
	{ value: "post_production_manager", label: "Post-Production Manager" },
	{ value: "hr", label: "HR" },
];

interface EditMemberRolesDialogProps {
	memberId: string;
	memberName: string;
	currentRoles: string[];
	onRolesUpdate: (newRoles: string[]) => void;
	isDisabled?: boolean;
}

export function EditMemberRolesDialog({
	memberId,
	memberName,
	currentRoles,
	onRolesUpdate,
	isDisabled = false,
}: EditMemberRolesDialogProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const [isSaving, setIsSaving] = React.useState(false);
	const [selectedRoles, setSelectedRoles] = React.useState(currentRoles);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await authClient.organization.updateMemberRole({
				memberId,
				role: selectedRoles.concat("member") as (
					| "admin"
					| "manager"
					| "post_production_manager"
					| "hr"
				)[],
			});
			onRolesUpdate(selectedRoles);
			toast.success(`Roles for ${memberName} updated successfully.`);
			setIsOpen(false);
		} catch (error) {
			toast.error("Failed to update roles. Please try again.");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	React.useEffect(() => {
		if (isOpen) {
			setSelectedRoles(currentRoles);
		}
	}, [isOpen, currentRoles]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" disabled={isDisabled}>
					<Pencil className="h-4 w-4" />
					<span className="sr-only">Edit Roles</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit roles for {memberName}</DialogTitle>
					<DialogDescription>
						Select the roles you want to assign to this member. Changes will be
						saved upon clicking the save button.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<MultiAsyncSelect
						options={assignableRoles}
						defaultValue={selectedRoles}
						onValueChange={setSelectedRoles}
						placeholder="Assign roles..."
					/>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
