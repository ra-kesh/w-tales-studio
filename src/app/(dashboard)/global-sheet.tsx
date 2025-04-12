import { ShootCreateSheet } from "@/app/(dashboard)/shoots/_components/shoot-create-sheet";
import { ShootEditSheet } from "./shoots/_components/shoot-edit-sheet";
import { PackageEditSheet } from "./configurations/_components/package-edit-sheet";

export async function GlobalSheets() {
	return (
		<>
			<ShootCreateSheet />
			<ShootEditSheet />
			<PackageEditSheet />
		</>
	);
}
