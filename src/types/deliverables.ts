import type { Deliverable } from "@/lib/db/schema";

export type DeliverableAssignment = {
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

export type DeliverableRowData = Deliverable & {
	booking: { name: string };
	deliverablesAssignments: DeliverableAssignment[];
};

export interface DeliverablesResponse {
	data: DeliverableRowData[];
	total: number;
}
