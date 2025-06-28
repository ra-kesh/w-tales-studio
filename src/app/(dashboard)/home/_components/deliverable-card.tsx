// components/assignments/deliverable-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast } from "date-fns";

export function DeliverableCard({ assignment }) {
	const { deliverable } = assignment;
	const dueDate = deliverable.dueDate ? new Date(deliverable.dueDate) : null;
	const isOverdue =
		dueDate && isPast(dueDate) && deliverable.status !== "delivered";

	return (
		<Card className="w-full shadow-sm">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-base font-semibold">
							{deliverable.title}
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							For: {deliverable.booking.name}
						</p>
					</div>
					<Badge variant="outline" className="capitalize">
						{deliverable.status.replace("_", " ")}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex justify-between items-end">
					<div>
						<p className="text-sm">Quantity: {deliverable.quantity}</p>
						{dueDate && (
							<p
								className={`text-xs ${
									isOverdue ? "text-destructive" : "text-muted-foreground"
								}`}
							>
								Due: {format(dueDate, "MMM dd, yyyy")}
							</p>
						)}
					</div>
					<Button size="sm" variant="secondary">
						Update Progress
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
