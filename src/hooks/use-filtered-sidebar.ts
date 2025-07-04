import * as React from "react";
import { type NavItemWithPermissions, sidebarData } from "@/data/sidebar-data";
import { authClient, useSession } from "@/lib/auth/auth-client";

export function useFilteredSidebar() {
	const { data: session } = useSession();
	const roles = session?.roles ?? [];

	const filteredSidebar = React.useMemo(() => {
		/**
		 * Checks if a user has permission for a specific action based on their array of roles.
		 * It iterates through each role and returns true if any of them grant access.
		 * @param requiredPermission The permission object from the sidebar item.
		 * @param userRoles The array of roles the current user has.
		 * @returns {boolean} - True if the user has permission, false otherwise.
		 */
		const checkUserPermissions = (
			requiredPermission: any,
			userRoles: string[],
		): boolean => {
			// If there are no roles, there are no permissions.
			if (userRoles.length === 0) {
				return false;
			}

			// Check each role the user has.
			for (const role of userRoles) {
				// Use the CORRECT function path as you pointed out.
				const hasAccess = authClient.organization.checkRolePermission({
					role, // Pass the single role string here.
					permissions: requiredPermission,
				});

				// If any role grants access, we can stop and return true immediately.
				if (hasAccess) {
					return true;
				}
			}

			// If the loop completes without finding a permissive role, return false.
			return false;
		};

		const filterItems = (
			items: NavItemWithPermissions[],
		): NavItemWithPermissions[] => {
			return items
				.map((item) => {
					if (!item.permission) {
						return item;
					}

					// Check permissions using our new, correct helper function.
					const hasAccess = checkUserPermissions(item.permission, roles);

					// If the item has sub-items, filter them recursively.
					if (item.items && item.items.length > 0) {
						const filteredSubItems = filterItems(item.items);

						// Show the parent only if it has visible children.
						if (filteredSubItems.length > 0) {
							return { ...item, items: filteredSubItems };
						}
						return null; // Hide parent if all children are hidden.
					}

					// If no sub-items, return the item only if the user has access.
					return hasAccess ? item : null;
				})
				.filter((item): item is NavItemWithPermissions => item !== null);
		};

		return {
			navMain: filterItems(sidebarData.navMain),
			navSecondary: filterItems(sidebarData.navSecondary),
		};
	}, [roles]);

	return filteredSidebar;
}
