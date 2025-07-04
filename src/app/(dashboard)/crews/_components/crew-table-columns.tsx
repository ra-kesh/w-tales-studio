"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/auth/auth-client";
import type { Crew, Member } from "@/lib/db/schema";
import { EditMemberRolesDialog } from "../../settings/_components/edit-member-roles";
import { CrewTableRowActions } from "./crew-table-row-actions";

export function useCrewColumns<TData>() {
	const { data: session } = useSession();

	const queryClient = useQueryClient();

	const isCurrentUserOwnerOrAdmin =
		session?.roles.includes("owner") || session?.roles.includes("admin");

	const router = useRouter();

	const handleRolesUpdate = () => {
		router.refresh();
		queryClient.invalidateQueries({ queryKey: ["crews"] });
		queryClient.refetchQueries({ queryKey: ["crews"] });
	};

	const columns: ColumnDef<Crew & { member: Member }>[] = [
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
			accessorKey: "member",
			header: "Name",
			filterFn: (row, id, value) => {
				const member = row.getValue("member");

				const name = member?.user?.name || row.original.name;
				const email = member?.user?.email || row.original.email;

				const searchValue = (value as string).toLowerCase();
				return (
					name?.toLowerCase().includes(searchValue) ||
					email?.toLowerCase().includes(searchValue) ||
					false
				);
			},
			cell: ({ row }) => {
				const member = row.getValue("member");
				const name = member?.user?.name || row.original.name;
				const email = member?.user?.email || row.original.email;
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
							<div className="font-medium">{name}</div>
							{email && (
								<div className="text-sm text-muted-foreground">{email}</div>
							)}
						</div>
					</div>
				);
			},
		},
		{
			accessorKey: "member.role",
			header: "Role",
			cell: ({ row }) => {
				const isThisMemberOwner = row.original.member.role.includes("owner");
				return row.original.member.role ? (
					<div className="flex items-center space-x-2">
						<div className="font-medium  space-x-2">
							{row.original.member.role.split(",").map((role) => {
								return (
									<>
										<Badge
											key={role}
											variant={role === "owner" ? "default" : "secondary"}
										>
											{role.charAt(0).toUpperCase() + role.slice(1)}
										</Badge>
									</>
								);
							})}
						</div>
						{isThisMemberOwner ? (
							<div className="w-10" /> // Placeholder for alignment
						) : (
							<EditMemberRolesDialog
								memberId={row.original.member.id}
								memberName={row.original.member.user.name}
								currentRoles={row.original.member.role
									.split(",")
									.filter((role) => role !== "member")}
								onRolesUpdate={handleRolesUpdate}
								isDisabled={!isCurrentUserOwnerOrAdmin}
							/>
						)}
					</div>
				) : (
					"—"
				);
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
