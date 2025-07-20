"use client";

import { Button } from "@/components/ui/button";
import { usePaymentsParams } from "@/hooks/use-payments-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenScheduledPaymentSheet() {
	const { setParams } = usePaymentsParams();

	const { canCreateAndUpdatePayment } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createScheduledPayment: true })}
				disabled={!canCreateAndUpdatePayment}
			>
				Schedule Payment
			</Button>
		</div>
	);
}
