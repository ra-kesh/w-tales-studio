"use client";

import { Button } from "@/components/ui/button";
import { useCrewParams } from "@/hooks/use-crew-params";

export function OpenCrewSheet() {
	const { setParams } = useCrewParams();

	return (
		<div>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
				onClick={() => setParams({ createCrew: true })}
			>
				Add Crew
			</Button>
		</div>
	);
}
