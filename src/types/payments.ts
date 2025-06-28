import type {
	ReceivedAmount,
	PaymentSchedule,
	Booking,
	Invoice,
} from "@/lib/db/schema";

export type ReceivedPaymentRow = ReceivedAmount & {
	booking: Pick<Booking, "name"> | null;
	invoice: Pick<Invoice, "invoiceNumber"> | null;
};

export type ReceivedPaymentsResponse = {
	data: ReceivedPaymentRow[];
	total: number;
	pageCount: number;
};

export type ScheduledPaymentRow = PaymentSchedule & {
	booking: Pick<Booking, "name"> | null;
};

export type PaymentSchedulesResponse = {
	data: ScheduledPaymentRow[];
	total: number;
	pageCount: number;
};
