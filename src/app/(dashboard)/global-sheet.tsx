"use client";

import { ShootCreateSheet } from "@/app/(dashboard)/shoots/_components/shoot-create-sheet";
import { PackageCreateSheet } from "./configurations/_components/package-create-sheet";
import { PackageEditSheet } from "./configurations/_components/package-edit-sheet";
import { ShootEditSheet } from "./shoots/_components/shoot-edit-sheet";
import { Suspense } from "react";
import { DeliverableCreateSheet } from "./deliverables/_components/deliverable-create-sheet";
import { DeliverableEditSheet } from "./deliverables/_components/deliverable-edit-sheet";
import { TaskCreateSheet } from "./tasks/_components/task-create-sheet";
import { TaskEditSheet } from "./tasks/_components/task-edit-sheet";
import { ExpenseCreateSheet } from "./expenses/_components/expense-create-sheet";
import { ExpenseEditSheet } from "./expenses/_components/expense-edit-sheet";
import { ClientEditSheet } from "./clients/_components/client-edit-sheet";

export function GlobalSheets() {
	return (
		<>
			<ShootCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ShootEditSheet />
			</Suspense>
			<PackageCreateSheet />
			<PackageEditSheet />
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
		</>
	);
}
