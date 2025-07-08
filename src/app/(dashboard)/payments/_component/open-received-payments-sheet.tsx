"use client";

import { Button } from "@/components/ui/button";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";
import { useShootsParams } from "@/hooks/use-shoots-params";

export function OpenRecviedPaymentSheet() {
	const { setParams } = usePaymentsParams();

	const { canCreateAndUpdatePayment } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createReceivedPayment: true })}
				disabled={!canCreateAndUpdatePayment}
			>
				Add Received Payment
			</Button>
		</div>
	);
}
