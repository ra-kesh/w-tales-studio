"use client";

import { Button } from "@/components/ui/button";
import { useCrewParams } from "@/hooks/use-crew-params";
import { usePermissions } from "@/hooks/use-permissions";

export function OpenCrewSheet() {
	const { setParams } = useCrewParams();

	const { canCreateAndUpdateCrew } = usePermissions();

	return (
		<div>
			<Button
				size="sm"
				className="font-semibold cursor-pointer"
				onClick={() => setParams({ createCrew: true })}
				disabled={!canCreateAndUpdateCrew}
			>
				Add Crew
			</Button>
		</div>
	);
}
