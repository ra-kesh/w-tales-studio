"use client";

import { useAllDeliverableAssignments } from "@/hooks/use-all-deliverables-assignment";
import { DeliverableCard } from "./deliverable-card";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AllDeliverables() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } = useAllDeliverableAssignments();

  if (isLoading) {
    return <div>Loading deliverables...</div>;
  }

  if (isError || !data) {
    return <div>Could not load deliverables. Please try again later.</div>;
  }

  const deliverables = data.pages.flatMap(page => page.data);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {deliverables.length > 0 ? (
          <>
            {deliverables.map((assignment) => (
              <DeliverableCard key={assignment.id} assignment={assignment} />
            ))}
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => fetchNextPage()}
                  disabled={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Package}
            title="No Deliverables Found"
            description="You don't have any deliverables assigned to you."
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}