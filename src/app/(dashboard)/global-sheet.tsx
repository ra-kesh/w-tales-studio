import { Suspense } from "react";
import { ShootCreateSheet } from "@/app/(dashboard)/shoots/_components/shoot-create-sheet";
import { BookingEditSheet } from "./bookings/_components/booking-form/booking-edit-sheet";
import { ClientEditSheet } from "./clients/_components/client-edit-sheet";
import { DeliverableStatusCreateSheet } from "./configurations/_components/deliverable-status-create-sheet";
import { DeliverableStatusEditSheet } from "./configurations/_components/deliverable-status-edit-sheet";
import { TaskStatusCreateSheet } from "./configurations/_components/task-status-create-sheet";
import { TaskStatusEditSheet } from "./configurations/_components/task-status-edit-sheet";
import { BookingTypeCreateSheet } from "./configurations/booking-types/_components/booking-type-create-sheet";
import { BookingTypeEditSheet } from "./configurations/booking-types/_components/booking-type-edit-sheet";
import { PackageCreateSheet } from "./configurations/packages/_components/package-create-sheet";
import { PackageEditSheet } from "./configurations/packages/_components/package-edit-sheet";
import { CrewCreateSheet } from "./crews/_components/crew-create-sheet";
import { CrewEditSheet } from "./crews/_components/crew-edit-sheet";
import { DeliverableCreateSheet } from "./deliverables/_components/deliverable-create-sheet";
import { DeliverableEditSheet } from "./deliverables/_components/deliverable-edit-sheet";
import { ExpenseCreateSheet } from "./expenses/_components/expense-create-sheet";
import { ExpenseEditSheet } from "./expenses/_components/expense-edit-sheet";
import { DeliverableReviewSheet } from "./home/_components/review/deliverable-review-sheet";
import { TaskReviewSheet } from "./home/_components/review/task-review-sheet";
import { ReceivedPaymentCreateSheet } from "./payments/_component/received-payment-create-sheet";
import { ReceivedPaymentEditSheet } from "./payments/_component/received-payment-edit-sheet";
import { ScheduledPaymentCreateSheet } from "./payments/_component/scheduled-payment-create-sheet";
import { ScheduledPaymentEditSheet } from "./payments/_component/scheduled-payment-edit-sheet";
import { ShootEditSheet } from "./shoots/_components/shoot-edit-sheet";
import { TaskCreateSheet } from "./tasks/_components/task-create-sheet";
import { TaskEditSheet } from "./tasks/_components/task-edit-sheet";

export function GlobalSheets() {
	return (
		<>
			<ShootCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ShootEditSheet />
			</Suspense>
			<Suspense fallback={<div>Loading...</div>}>
				<BookingEditSheet />
			</Suspense>
			<PackageCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<PackageEditSheet />
			</Suspense>
			<BookingTypeCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<BookingTypeEditSheet />
			</Suspense>
			<DeliverableStatusCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<DeliverableStatusEditSheet />
			</Suspense>
			<TaskStatusCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<TaskStatusEditSheet />
			</Suspense>
			{/* <TaskPriorityCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<TaskPriorityEditSheet />
			</Suspense> */}

			<DeliverableCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<DeliverableEditSheet />
			</Suspense>
			<TaskCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<TaskEditSheet />
			</Suspense>
			<ExpenseCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ExpenseEditSheet />
			</Suspense>
			<Suspense fallback={<div>Loading...</div>}>
				<ClientEditSheet />
			</Suspense>
			<CrewCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<CrewEditSheet />
			</Suspense>
			<ReceivedPaymentCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ReceivedPaymentEditSheet />
			</Suspense>
			<ScheduledPaymentCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ScheduledPaymentEditSheet />
			</Suspense>
			<Suspense fallback={<div>Loading...</div>}>
				<TaskReviewSheet />
			</Suspense>
			<Suspense fallback={<div>Loading...</div>}>
				<DeliverableReviewSheet />
			</Suspense>
		</>
	);
}
