import { authClient, useSession } from "@/lib/auth/auth-client";
import type { AppRole } from "@/lib/auth/permission";

export const usePermissions = () => {
	const { data: session } = useSession();
	const userRoles = (session?.roles ?? []) as AppRole[];

	const canCreateAndUpdateBooking = authClient.organization.checkRolePermission(
		{
			permissions: {
				booking: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		},
	);
	const canCreateAndUpdateShoot = authClient.organization.checkRolePermission({
		permissions: {
			shoot: ["create", "update"],
		},
		role: userRoles.join(",") as AppRole,
	});
	const canCreateAndUpdateDeliverable =
		authClient.organization.checkRolePermission({
			permissions: {
				deliverable: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		});
	const canCreateAndUpdateTask = authClient.organization.checkRolePermission({
		permissions: {
			task: ["create", "update"],
		},
		role: userRoles.join(",") as AppRole,
	});
	const canCreateAndUpdateExpense = authClient.organization.checkRolePermission(
		{
			permissions: {
				expense: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		},
	);
	const canCreateAndUpdatePayment = authClient.organization.checkRolePermission(
		{
			permissions: {
				payment: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		},
	);
	const canCreateAndUpdateCrew = authClient.organization.checkRolePermission({
		permissions: {
			crew: ["create", "update"],
		},
		role: userRoles.join(",") as AppRole,
	});
	const canCreateAndUpdateBookingTypes =
		authClient.organization.checkRolePermission({
			permissions: {
				booking_type_config: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		});
	const canCreateAndUpdatePackageTypes =
		authClient.organization.checkRolePermission({
			permissions: {
				package_type_config: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		});
	const canCreateAndUpdateDeliverableStatus =
		authClient.organization.checkRolePermission({
			permissions: {
				deliverable_status_config: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		});
	const canCreateAndUpdateTaskStatus =
		authClient.organization.checkRolePermission({
			permissions: {
				task_status_config: ["create", "update"],
			},
			role: userRoles.join(",") as AppRole,
		});

	return {
		canCreateAndUpdateBooking,
		canCreateAndUpdateShoot,
		canCreateAndUpdateDeliverable,
		canCreateAndUpdateExpense,
		canCreateAndUpdatePayment,
		canCreateAndUpdateTask,
		canCreateAndUpdateCrew,
		canCreateAndUpdateBookingTypes,
		canCreateAndUpdatePackageTypes,
		canCreateAndUpdateDeliverableStatus,
		canCreateAndUpdateTaskStatus,
	};
};
