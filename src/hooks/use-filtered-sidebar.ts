import * as React from "react";
import {
	type NavItemWithPermissions,
	type NavSection,
	sidebarData,
} from "@/data/sidebar-data";
import { authClient, useSession } from "@/lib/auth/auth-client";
import type { AppRole } from "@/lib/auth/permission";

export function useFilteredSidebar() {
	const { data: session } = useSession();
	const userRoles = (session?.roles ?? []) as AppRole[];

	const filteredSidebar = React.useMemo(() => {
		const checkUserPermissions = (
			requiredPermission:
				| {
						[key: string]: string[];
				  }
				| undefined,
		): boolean => {
			if (!requiredPermission) return true;
			if (userRoles.length === 0) return false;
			return authClient.organization.checkRolePermission({
				role: userRoles.join(",") as AppRole,
				permissions: requiredPermission,
			});
		};

		const filterSections = (sections: NavSection[]): NavSection[] => {
			return sections
				.map((section) => {
					const visibleItems = section.items.filter((item) =>
						checkUserPermissions(item.permissions),
					);

					if (visibleItems.length === 0) {
						return null;
					}

					return { ...section, items: visibleItems };
				})
				.filter((section): section is NavSection => section !== null);
		};

		const filterSecondaryItems = (
			items: NavItemWithPermissions[],
		): NavItemWithPermissions[] => {
			return items.filter((item) => checkUserPermissions(item.permissions));
		};

		return {
			navMainSections: filterSections(sidebarData.navMain),
			navSecondary: filterSecondaryItems(sidebarData.navSecondary),
		};
	}, [userRoles]);

	return filteredSidebar;
}
