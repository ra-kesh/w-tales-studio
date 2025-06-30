"use client";

import { usePackageTypes } from "@/hooks/use-configs";
import { usePackageParams } from "@/hooks/use-package-params";
import { PackageTable } from "./_components/package-table";

export default function PackageConfigs() {
	const { data: packageTypes = [] } = usePackageTypes();
	const { setParams } = usePackageParams();

	const handleEdit = (id: number) => {
		setParams({ packageId: id.toString() });
	};

	const handleDelete = (id: number) => {
		console.log("Delete package:", id);
	};

	return (
		<div className="space-y-6">
			<PackageTable
				data={packageTypes}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
