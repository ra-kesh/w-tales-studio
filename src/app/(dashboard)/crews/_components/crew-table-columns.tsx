"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/auth/auth-client";
import type { CrewWithMember } from "@/types/crew";
import { EditMemberRolesDialog } from "../../settings/_components/edit-member-roles";
import { CrewTableRowActions } from "./crew-table-row-actions";

export function useCrewColumns<TData>() {
	const { data: session } = useSession();

	const queryClient = useQueryClient();

	const isCurrentUserOwnerOrAdmin =
		session?.roles.includes("owner") || session?.roles.includes("admin");

	const handleRolesUpdate = () => {
		queryClient.invalidateQueries({ queryKey: ["crews"] });
	};

	const columns: ColumnDef<CrewWithMember>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "name",
			header: "Name",
			filterFn: (row, id, value) => {
				const { name, email, member } = row.original;
				const displayName = member?.user?.name || name;
				const displayEmail = member?.user?.email || email;

				const searchValue = (value as string).toLowerCase();
				return (
					displayName?.toLowerCase().includes(searchValue) ||
					displayEmail?.toLowerCase().includes(searchValue) ||
					false
				);
			},
			cell: ({ row }) => {
				const { name, email, member } = row.original;
				const displayName = member?.user?.name || name;
				const displayEmail = member?.user?.email || email;
				const image = member?.user?.image;

				return (
					<div className="flex items-center gap-3">
						<Avatar className="h-9 w-9">
							<AvatarImage src={image || undefined} />
							<AvatarFallback>
								<UserIcon className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-medium">{displayName}</div>
							{displayEmail && (
								<div className="text-sm text-muted-foreground">
									{displayEmail}
								</div>
							)}
						</div>
					</div>
				);
			},
		},
		{
			id: "roles",
			header: "Role",
			cell: ({ row }) => {
				const { member, role: crewRole } = row.original;

				if (member) {
					const systemRoles = member.role.split(",");
					const isThisMemberOwner = systemRoles.includes("owner");

					return (
						<div className="flex items-center space-x-2">
							<div className="flex flex-wrap gap-1">
								{systemRoles.map((role) => (
									<Badge
										key={role}
										variant={role === "owner" ? "default" : "secondary"}
									>
										{role.charAt(0).toUpperCase() + role.slice(1)}
									</Badge>
								))}
							</div>
							{isThisMemberOwner ? (
								<div className="w-10" />
							) : (
								<EditMemberRolesDialog
									memberId={member.id}
									memberName={member.user.name}
									currentRoles={systemRoles.filter((role) => role !== "member")}
									onRolesUpdate={handleRolesUpdate}
									isDisabled={!isCurrentUserOwnerOrAdmin}
								/>
							)}
						</div>
					);
				}

				if (crewRole) {
					return (
						<Badge variant="outline">
							{crewRole.charAt(0).toUpperCase() + crewRole.slice(1)}
						</Badge>
					);
				}

				return <span className="text-muted-foreground">—</span>;
			},
		},
		{
			accessorKey: "specialization",
			header: "Specialization",
			cell: ({ row }) => {
				const specialization = row.getValue("specialization") as string;
				return specialization ? (
					<div className="font-medium">{specialization}</div>
				) : (
					"—"
				);
			},
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("status") as string;
				return (
					<Badge
						variant={
							status === "available"
								? "default"
								: status === "unavailable"
									? "destructive"
									: "secondary"
						}
					>
						{status}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => <CrewTableRowActions row={row} />,
		},
	];

	return columns;
}
