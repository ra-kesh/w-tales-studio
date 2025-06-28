"use client";

import { useAllShootAssignments } from "@/hooks/use-all-shoots-assignment";
import { ShootCard } from "./shoots-card";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AllShoots() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } = useAllShootAssignments();

  if (isLoading) {
    return <div>Loading shoots...</div>;
  }

  if (isError || !data) {
    return <div>Could not load shoots. Please try again later.</div>;
  }

  const shoots = data.pages.flatMap(page => page.data);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {shoots.length > 0 ? (
          <>
            {shoots.map((assignment) => (
              <ShootCard key={assignment.id} assignment={assignment} />
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
            icon={Camera}
            title="No Shoots Found"
            description="You don't have any shoots assigned to you."
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