"use client";

import { useAllTaskAssignments } from "@/hooks/use-all-task-assignment";
import { TaskCard } from "./task-card";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AllTasks() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } = useAllTaskAssignments();

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (isError || !data) {
    return <div>Could not load tasks. Please try again later.</div>;
  }

  const tasks = data.pages.flatMap(page => page.data);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {tasks.length > 0 ? (
          <>
            {tasks.map((assignment) => (
              <TaskCard key={assignment.id} assignment={assignment} />
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
            icon={CheckCircle2}
            title="No Tasks Found"
            description="You don't have any tasks assigned to you."
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