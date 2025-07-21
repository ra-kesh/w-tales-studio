"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MultiAsyncSelect } from "@/components/ui/multi-select";
import { authClient } from "@/lib/auth/auth-client";

const assignableRoles = [
	{ value: "admin", label: "Admin" },
	{ value: "manager", label: "Manager" },
	{ value: "post_production_manager", label: "Post-Production Manager" },
	{ value: "hr", label: "HR" },
];

interface MemberRoleManagerProps {
	memberId: string;
	currentRoles: string[];
	isCurrentUserOwner: boolean;
}

export function MemberRoleManager({
	memberId,
	currentRoles,
	isCurrentUserOwner,
}: MemberRoleManagerProps) {
	const [isLoading, setIsLoading] = React.useState(false);

	// The owner's role cannot be changed.
	const isOwner = currentRoles.includes("owner");
	const isDisabled = isOwner || isLoading || !isCurrentUserOwner;

	const handleRoleChange = async (newRoles: string[]) => {
		setIsLoading(true);
		try {
			// Cast newRoles to the correct type
			await authClient.organization.updateMemberRole({
				memberId,
				role: newRoles as (
					| "admin"
					| "manager"
					| "post_production_manager"
					| "hr"
				)[],
			});
			toast.success("Member roles updated successfully.");
		} catch (error) {
			toast.error("Failed to update roles. Please try again.");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isOwner) {
		return <Badge>Owner</Badge>;
	}

	return (
		<div className="w-56">
			<MultiAsyncSelect
				options={assignableRoles}
				defaultValue={currentRoles}
				onValueChange={handleRoleChange}
				placeholder="Assign roles..."
				className={isDisabled ? "cursor-not-allowed bg-gray-100" : ""}
				{...(isDisabled && { "aria-disabled": true, tabIndex: -1 })}
			/>
		</div>
	);
}
