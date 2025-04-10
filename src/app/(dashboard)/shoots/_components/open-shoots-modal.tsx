"use client";

import { Button } from "@/components/ui/button";
import { useShootsParams } from "@/hooks/use-shoots-params";

export function OpenShootsModal() {
  const { setParams } = useShootsParams();

  return (
    <div>
      <Button onClick={() => setParams({ createShoot: true })}>
        Add Shoot
      </Button>
    </div>
  );
}
