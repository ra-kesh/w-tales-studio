import type { Deliverable, DeliverablesAssignment } from "@/lib/db/schema";

export type DeliverableRowData = Deliverable & {
	booking: { name: string };
	deliverablesAssignments: DeliverablesAssignment[];
};

export interface DeliverablesResponse {
	data: DeliverableRowData[];
	total: number;
	pageCount: number;
	limit: number;
}
