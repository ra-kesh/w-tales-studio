// components/assignments/task-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";

export function TaskCard({ assignment }) {
	const { task } = assignment;
	const dueDate = task.dueDate ? new Date(task.dueDate) : null;
	const isOverdue = dueDate && isPast(dueDate) && task.status !== "completed";

	return (
		<Card className="w-full shadow-sm">
			<CardContent className="p-4">
				<div className="flex justify-between items-start gap-4">
					<div className="flex-grow">
						<p className="font-medium">{task.description}</p>
						<p className="text-sm text-muted-foreground">
							For: {task.booking.name}
						</p>
						{task.deliverable && (
							<p className="text-xs text-muted-foreground">
								→ Deliverable: {task.deliverable.title}
							</p>
						)}
					</div>
					<div className="text-right flex-shrink-0">
						<p className="text-sm capitalize">
							{task.status.replace("_", " ")}
						</p>
						<p className="text-xs capitalize text-muted-foreground">
							{task.priority} Priority
						</p>
					</div>
				</div>
				<div className="flex justify-between items-end mt-3">
					{dueDate ? (
						<p
							className={`text-xs ${
								isOverdue ? "text-destructive" : "text-muted-foreground"
							}`}
						>
							Due: {format(dueDate, "MMM dd, yyyy")}
						</p>
					) : (
						<div />
					)}
					<Button size="sm" variant="secondary">
						Update
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
