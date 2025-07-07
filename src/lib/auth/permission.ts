import { createAccessControl } from "better-auth/plugins/access";

import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
	...defaultStatements,
	dashboard: ["read"],
	booking: ["create", "read", "update", "delete", "list"],
	client: ["create", "read", "update", "delete", "list"],
	shoot: ["create", "read", "update", "delete", "list", "assign_crew"],
	deliverable: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	crew: ["create", "read", "update", "delete", "list"],
	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	studio: [
		"view_studio",
		"change_logo",
		"change_name",
		"view_invites",
		"create_invites",
	],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
	dashboard: ["read"],
	booking: ["create", "read", "update", "delete", "list"],
	client: ["create", "read", "update", "delete", "list"],
	shoot: ["create", "read", "update", "delete", "list", "assign_crew"],
	deliverable: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	crew: ["create", "read", "update", "delete", "list"],

	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	studio: [
		"view_studio",
		"change_logo",
		"change_name",
		"view_invites",
		"create_invites",
	],
	...ownerAc.statements,
});

export const studio_admin = ac.newRole({
	dashboard: ["read"],
	booking: ["create", "read", "update", "delete", "list"],
	client: ["create", "read", "update", "delete", "list"],
	shoot: ["create", "read", "update", "delete", "list", "assign_crew"],
	deliverable: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	crew: ["create", "read", "update", "delete", "list"],
	studio: [
		"view_studio",
		"change_logo",
		"change_name",
		"view_invites",
		"create_invites",
	],

	...adminAc.statements,
});

export const member = ac.newRole({
	task: ["read", "list", "update_status"],
	deliverable: ["read", "list", "update_status"],
	shoot: ["read", "list"],
	...memberAc.statements,
});

export const crew = ac.newRole({
	task: ["read", "list", "update_status"],
	// deliverable: ["read", "list", "update_status"],
	// shoot: ["read", "list"],
});

export const manager = ac.newRole({
	// dashboard: ["read"],
	// booking: ["read", "list"],
	// client: ["read", "list"],
	shoot: ["create", "read", "update", "list", "assign_crew"],
	deliverable: ["create", "read", "update", "list", "assign_crew"],
	task: ["create", "read", "update", "list", "assign_crew"],
	// expense: ["read", "list"], // Can see expenses but not manage them
});

export const post_production_manager = ac.newRole({
	// dashboard: ["read"],
	// shoot: ["read", "list"], // Read-only access to see shoot context
	deliverable: ["create", "read", "update", "list", "assign_crew"],
	task: ["create", "read", "update", "list", "assign_crew"],
});

export const hr = ac.newRole({
	// dashboard: ["read"],
	shoot: ["read", "list"],
	deliverable: ["read", "list"],
	task: ["read", "list"],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
});
