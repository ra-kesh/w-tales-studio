import type {
	Booking,
	Deliverable,
	DeliverablesAssignment,
} from "@/lib/db/schema";

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

// The shape of the assignment data returned by your hooks
export type DeliverableAssignmentWithRelations = {
	id: number;
	deliverableId: number;
	crewId: number;
	isLead: boolean;
	organizationId: string;
	assignedAt: string;
	assignedBy: number | null;
	createdAt: string;
	updatedAt: string;
	deliverable: Deliverable & {
		booking: Pick<Booking, "id" | "name">;
	};
};
