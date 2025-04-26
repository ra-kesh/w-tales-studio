"use client";

import { ShootCreateSheet } from "@/app/(dashboard)/shoots/_components/shoot-create-sheet";

import { PackageEditSheet } from "./configurations/_components/package-edit-sheet";
import { ShootEditSheet } from "./shoots/_components/shoot-edit-sheet";
import { Suspense } from "react";
import { DeliverableCreateSheet } from "./deliverables/_components/deliverable-create-sheet";
import { DeliverableEditSheet } from "./deliverables/_components/deliverable-edit-sheet";

export function GlobalSheets() {
	return (
		<>
			<ShootCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<ShootEditSheet />
			</Suspense>
			<PackageEditSheet />
			<DeliverableCreateSheet />
			<Suspense fallback={<div>Loading...</div>}>
				<DeliverableEditSheet />
			</Suspense>
		</>
	);
}
