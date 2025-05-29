"use client";

import { format } from "date-fns";
import type { ActiveOrganization, Session } from "@/types/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditOrganisationDialog from "@/components/edit-organisation-dialog";

export function OrganizationSettings(props: {
	session: Session | null;
	activeOrganization: ActiveOrganization | null;
}) {
	const { activeOrganization } = props;

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	};

	return (
		<div>
			<div className="flex justify-between items-center">
				<div className="px-4 sm:px-0">
					<h3 className="text-base/7 font-semibold text-gray-900">
						Studio Information
					</h3>
					<p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
						Details of the studio currently selected.
					</p>
				</div>
				<div>
					<EditOrganisationDialog organization={activeOrganization} />
				</div>
			</div>
			<div className="mt-6 border-t border-gray-100">
				<dl className="divide-y divide-gray-100">
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900 lg:flex lg:items-center">
							Stdio Logo
						</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							<Avatar className="rounded-full h-10 w-10">
								<AvatarImage
									className="object-cover w-full h-full rounded-full"
									src={activeOrganization?.logo || undefined}
								/>
								<AvatarFallback className="rounded-full">
									{activeOrganization?.name?.charAt(0) || "P"}
								</AvatarFallback>
							</Avatar>
						</dd>
					</div>
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">Studio Name</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							{activeOrganization?.name}
						</dd>
					</div>
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">Studio Slug</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							{activeOrganization?.slug}
						</dd>
					</div>

					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">Created At</dt>
						<dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
							{format(
								new Date(activeOrganization?.createdAt || "N/a"),
								"MMMM dd, yyyy",
							)}
						</dd>
					</div>
					<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
						<dt className="text-sm/6 font-medium text-gray-900">Memebers</dt>
						<dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
							<ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
								{activeOrganization?.members.map((member) => (
									<div
										key={member.id}
										className="flex items-center justify-between p-4"
									>
										<div className="flex items-center space-x-4">
											<Avatar>
												<AvatarImage src={member.user.image || undefined} />
												<AvatarFallback>
													{getInitials(member.user.name)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{member.user.name}</p>
												<p className="text-sm text-muted-foreground">
													{member.user.email}
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-4">
											<Badge
												variant={
													member.role === "owner" ? "default" : "outline"
												}
											>
												{member.role.charAt(0).toUpperCase() +
													member.role.slice(1)}
											</Badge>
											<p className="text-sm text-muted-foreground">
												Joined{" "}
												{format(new Date(member.createdAt), "MMM dd, yyyy")}
											</p>
										</div>
									</div>
								))}
							</ul>
						</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
