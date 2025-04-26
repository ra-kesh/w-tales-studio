"use client";

import { Button } from "@/components/ui/button";
import { useDeliverableParams } from "@/hooks/use-deliverable-params";

export function OpenDeliverableSheet() {
  const { setParams } = useDeliverableParams();

  return (
    <div>
      <Button onClick={() => setParams({ createDeliverable: true })}>
        Add Deliverable
      </Button>
    </div>
  );
}
