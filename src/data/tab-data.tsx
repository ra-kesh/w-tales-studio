export interface TabItem {
	path: string;
	label: string;
	permissions?: {
		[key: string]: string[];
	};
}

export const settingsTabs: TabItem[] = [
	{
		path: "/settings/profile",
		label: "Profile",
	},
	{
		path: "/settings/organization",
		label: "Organization",
		permissions: { organization: ["update", "delete"] },
	},
	{
		path: "/settings/invites",
		label: "Invites",
		permissions: { invitation: ["create", "cancel"] },
	},
];

export const configTabs: TabItem[] = [
	{
		path: "/configurations/packages",
		label: "Package Types",
		permissions: { package_type_config: ["list"] },
	},
	{
		path: "/configurations/booking-types",
		label: "Booking Types",
		permissions: { booking_type_config: ["list"] },
	},
	{
		path: "/configurations/deliverable-status",
		label: "Deliverables Status",
		permissions: { deliverable_status_config: ["list"] },
	},
	{
		path: "/configurations/task-status",
		label: "Task Status",
		permissions: { task_status_config: ["list"] },
	},
];
