"use client";

import { useDeliverablesStatuses } from "@/hooks/use-configs";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";
import { DeliverableStatusTable } from "../_components/deliverable-status-table";

export default function DeliverableStatusConfigs() {
	const { data: deliverableStatus = [] } = useDeliverablesStatuses();
	const { setParams } = useDeliverableStatusParams();

	const handleEdit = (id: number) => {
		setParams({ deliverableStatusId: id.toString() });
	};

	const handleDelete = (id: number) => {
		console.log("Delete deliverable status:", id);
	};

	return (
		<div className="space-y-6">
			<DeliverableStatusTable
				data={deliverableStatus}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
