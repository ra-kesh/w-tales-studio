import * as React from "react";
import type { TabItem } from "@/data/tab-data";
import { authClient, useSession } from "@/lib/auth/auth-client";
import type { AppRole } from "@/lib/auth/permission";

export function useFilteredTabs(tabs: TabItem[]): TabItem[] {
	const { data: session } = useSession();
	const userRoles = (session?.roles ?? []) as AppRole[];

	const filteredTabs = React.useMemo(() => {
		const checkUserPermissions = (
			requiredPermissions:
				| {
						[key: string]: string[];
				  }
				| undefined,
		): boolean => {
			if (!requiredPermissions) return true;
			if (userRoles.length === 0) return false;

			return authClient.organization.checkRolePermission({
				role: userRoles.join(",") as AppRole,
				permissions: requiredPermissions,
			});
		};

		return tabs.filter((tab) => checkUserPermissions(tab.permissions));
	}, [userRoles, tabs]);

	return filteredTabs;
}
