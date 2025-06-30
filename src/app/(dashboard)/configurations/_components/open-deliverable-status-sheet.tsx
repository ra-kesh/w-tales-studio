"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableStatusParams } from "@/hooks/use-deliverable-status-params";

export function OpenDeliverableStatusSheet() {
	const { setParams } = useDeliverableStatusParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createDeliverableStatus: true })}
			>
				Add Deliverable Status
			</Button>
		</div>
	);
}