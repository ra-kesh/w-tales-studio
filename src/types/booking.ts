import type {
	Booking,
	Client,
	Deliverable,
	Expense,
	PaymentSchedule,
	ReceivedAmount,
	Shoot,
	Task,
} from "@/lib/db/schema";

export interface AttachmentStub {
	name: string;
	size: number | null;
	type: string | null;
	key: string;
	url: string;
}

export interface CrewStub {
	id: number;
	name: string | null;
	role: string | null;
	specialization: string | null;
	status: string;
	member: {
		user: {
			name: string;
			email: string;
			image: string | null;
		} | null;
	} | null;
}

export interface ParticipantWithClient {
	role: string;
	client: Client;
}

export interface ShootWithAssignments extends Shoot {
	shootsAssignments: {
		id: number;
		shootId: number;
		crewId: number;
		isLead: boolean;
		organizationId: string;
		assignedAt: Date | null;
		createdAt: Date | null;
		updatedAt: Date | null;
		crew: CrewStub;
	}[];
}

export interface DeliverableWithAssignments extends Deliverable {
	deliverablesAssignments: {
		id: number;
		deliverableId: number;
		crewId: number;
		isLead: boolean;
		organizationId: string;
		assignedAt: Date | null;
		createdAt: Date | null;
		updatedAt: Date | null;
		crew: CrewStub;
	}[];
}

export interface ReceivedAmountWithAttachment extends ReceivedAmount {
	attachment: AttachmentStub | null;
}

export interface BookingDetail extends Booking {
	bookingTypeKey: string;
	bookingTypeValue: string;
	packageTypeKey: string;
	packageTypeValue: string;
	participants: ParticipantWithClient[];
	shoots: ShootWithAssignments[];
	deliverables: DeliverableWithAssignments[];
	receivedAmounts: ReceivedAmountWithAttachment[];
	paymentSchedules: PaymentSchedule[];
	expenses: Expense[];
	tasks: Task[];
	contractAttachment: AttachmentStub | null;
	deliverablesAttachment: AttachmentStub | null;
}
