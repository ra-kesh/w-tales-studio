// components/assignments/shoot-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

export function ShootCard({ assignment }) {
	const { shoot } = assignment;
	const shootDate = new Date(shoot.date);
	const isOverdue = isPast(shootDate) && !isToday(shootDate);

	return (
		<Card className="w-full shadow-sm">
			<CardHeader>
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-base font-semibold">
							{shoot.title}
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							For: {shoot.booking.name}
						</p>
					</div>
					{assignment.isLead && <Badge variant="outline">Lead</Badge>}
				</div>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
						<span className={isOverdue ? "text-destructive" : ""}>
							{format(shootDate, "MMM dd, yyyy")}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span>{shoot.time}</span>
					</div>
				</div>
				{shoot.location && (
					<div className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">{shoot.location}</span>
					</div>
				)}
				<div className="flex justify-end items-center pt-2">
					<Button size="sm" variant="secondary">
						View Details
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
