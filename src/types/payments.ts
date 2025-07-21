import type {
	Booking,
	Invoice,
	PaymentSchedule,
	ReceivedAmount,
} from "@/lib/db/schema";

export type ReceivedPaymentRow = ReceivedAmount & {
	booking: Pick<Booking, "name">;
	invoice: Pick<Invoice, "invoiceNumber"> | null;
};

export type ReceivedPaymentsResponse = {
	data: ReceivedPaymentRow[];
	total: number;
	pageCount: number;
};

export type ScheduledPaymentRow = PaymentSchedule & {
	booking: Pick<Booking, "name">;
};

export type PaymentSchedulesResponse = {
	data: ScheduledPaymentRow[];
	total: number;
	pageCount: number;
};

export interface ReceivedPaymentDetail {
	id: number;
	bookingId: string;
	amount: string;
	description: string;
	paidOn: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	booking: {
		name: string;
	};
}

export interface ScheduledPaymentDetail {
	id: number;
	bookingId: string;
	amount: string;
	description: string;
	dueDate: string;
	booking: { name: string };
}
