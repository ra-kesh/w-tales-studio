"use client";

import { Button } from "@/components/ui/button";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenRecviedPaymentSheet() {
	const { setParams } = usePaymentsParams();

	const { canCreateAndUpdatePayment } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createReceivedPayment: true })}
				disabled={!canCreateAndUpdatePayment}
			>
				Add Received Payment
			</Button>
		</div>
	);
}
