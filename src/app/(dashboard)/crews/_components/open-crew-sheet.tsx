"use client";

import { Button } from "@/components/ui/button";
import { useCrewParams } from "@/hooks/use-crew-params";

export function OpenCrewSheet() {
  const { setParams } = useCrewParams();

  return (
    <div>
      <Button onClick={() => setParams({ createCrew: true })}>Add Crew</Button>
    </div>
  );
}
