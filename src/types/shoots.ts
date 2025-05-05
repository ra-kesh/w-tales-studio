import type { Shoot } from "@/lib/db/schema";

export type ShootAssignment = {
	crew: {
		name: string | null;
		role: string | null;
		specialization: string | null;
		member?: {
			user?: {
				name: string | null;
			};
		};
	};
	isLead?: boolean;
};

export type ShootRowData = Shoot & {
	booking: { name: string };
	shootsAssignments: ShootAssignment[];
};

export interface ShootsResponse {
	data: ShootRowData[];
	total: number;
}
