import * as React from "react";
import {
	type NavItemWithPermissions,
	type NavSection,
	sidebarData,
} from "@/data/sidebar-data";
import { authClient, useSession } from "@/lib/auth/auth-client";

export function useFilteredSidebar() {
	const { data: session } = useSession();
	const roles = session?.roles ?? [];

	const filteredSidebar = React.useMemo(() => {
		const checkUserPermissions = (
			requiredPermission: any,
			userRoles: string[],
		): boolean => {
			if (!requiredPermission) return true;
			if (userRoles.length === 0) return false;

			for (const role of userRoles) {
				if (
					authClient.organization.checkRolePermission({
						role,
						permissions: requiredPermission,
					})
				) {
					return true;
				}
			}
			return false;
		};

		const filterSections = (sections: NavSection[]): NavSection[] => {
			return sections
				.map((section) => {
					const visibleItems = section.items.filter((item) =>
						checkUserPermissions(item.permission, roles),
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
			return items.filter((item) =>
				checkUserPermissions(item.permission, roles),
			);
		};

		return {
			navMainSections: filterSections(sidebarData.navMain),
			navSecondary: filterSecondaryItems(sidebarData.navSecondary),
		};
	}, [roles]);

	return filteredSidebar;
}
