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
	review: ["list"],
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
		"submission",
		"review",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	crew: ["create", "read", "update", "delete", "list"],
	configuration: ["list"],
	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	settings_organization: ["read", "update"],
	settings_invites: ["read", "create", "delete"],
	settings_profile: ["read", "update"],
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
	review: ["list"],
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
		"submission",
		"review",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	crew: ["create", "read", "update", "delete", "list"],
	configuration: ["list"],
	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	settings_organization: ["read", "update"],
	settings_invites: ["read", "create", "delete"],
	settings_profile: ["read", "update"],
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
	review: ["list"],
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
		"submission",
		"review",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
	configuration: ["list"],
	package_type_config: ["create", "read", "update", "delete", "list"],
	booking_type_config: ["create", "read", "update", "delete", "list"],
	deliverable_status_config: ["create", "read", "update", "delete", "list"],
	task_status_config: ["create", "read", "update", "delete", "list"],
	settings_organization: ["read", "update"],
	settings_invites: ["read", "create", "delete"],
	settings_profile: ["read", "update"],
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
	task: ["read", "list", "update_status", "submission"],
	deliverable: ["read", "list", "update_status", "submission"],
	shoot: ["read", "list"],
	...memberAc.statements,
});

export const crew = ac.newRole({
	task: ["read", "list", "update_status", "submission"],
	// deliverable: ["read", "list", "update_status"],
	// shoot: ["read", "list"],
});

export const manager = ac.newRole({
	// dashboard: ["read"],
	review: ["list"],
	// booking: ["read", "list"],
	// client: ["read", "list"],
	shoot: ["create", "read", "update", "list", "assign_crew"],
	deliverable: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	// expense: ["read", "list"], // Can see expenses but not manage them
});

export const post_production_manager = ac.newRole({
	// dashboard: ["read"],
	review: ["list"],
	// shoot: ["read", "list"], // Read-only access to see shoot context
	deliverable: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
	task: [
		"create",
		"read",
		"update",
		"delete",
		"list",
		"assign_crew",
		"update_status",
		"submission",
		"review",
	],
});

export const hr = ac.newRole({
	// dashboard: ["read"],
	shoot: ["read", "list"],
	deliverable: ["read", "list"],
	task: ["read", "list"],
	expense: ["create", "read", "update", "delete", "list"],
	payment: ["create", "read", "update", "delete", "list"],
});

export const appRoles = {
	owner,
	admin: studio_admin,
	member,
	manager,
	post_production_manager,
	hr,
};

export type AppRole = keyof typeof appRoles;
