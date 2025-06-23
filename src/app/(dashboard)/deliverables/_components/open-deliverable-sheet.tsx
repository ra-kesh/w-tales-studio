"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";

export function OpenDeliverableSheet() {
	const { setParams } = useDeliverableParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createDeliverable: true })}
			>
				Add Deliverable
			</Button>
		</div>
	);
}
