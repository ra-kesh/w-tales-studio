"use client";

import { PackageTable } from "../_components/package-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePackageTypes } from "@/hooks/use-configs";
// import { usePackageParams } from "@/hooks/use-package-params";
// import { PackageEditSheet } from "./_components/package-edit-sheet";

export default function ConfigPage() {
	const { data: packageTypes = [] } = usePackageTypes();
	//   const { setParams } = usePackageParams();

	//   const handleEdit = (id: number) => {
	//     setParams({ packageId: id.toString() });
	//   };

	const handleDelete = (id: number) => {
		// TODO: Implement delete functionality
		console.log("Delete package:", id);
	};

	//   const handleCreate = () => {
	//     setParams({ createPackage: "true" });
	//   };

	return (
		<div className="space-y-6">
			<PackageTable
				data={packageTypes}
				onEdit={() => {}}
				onDelete={handleDelete}
			/>
			{/* <div className="flex justify-between items-center">
			
				<Button className="ml-auto">
					<Plus className="h-4 w-4 mr-2" />
					Add Package
				</Button>
			</div> */}

			{/* <PackageEditSheet /> */}
		</div>
	);
}
