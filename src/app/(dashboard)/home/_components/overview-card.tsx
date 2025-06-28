import { Card, CardContent } from "@/components/ui/card";

// components/assignments/OverviewCard.tsx
interface OverviewCardProps {
	title: string;
	count: number;
	icon: React.ElementType;
	color: "blue" | "green" | "purple" | "orange";
}

export function OverviewCard({
	title,
	count,
	icon: Icon,
	color,
}: OverviewCardProps) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-700 border-blue-200",
		green: "bg-green-50 text-green-700 border-green-200",
		purple: "bg-purple-50 text-purple-700 border-purple-200",
		orange: "bg-orange-50 text-orange-700 border-orange-200",
	};

	return (
		<Card className={colorClasses[color]}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium opacity-70">{title}</p>
						<p className="text-2xl font-bold">{count}</p>
					</div>
					<Icon className="h-8 w-8 opacity-50" />
				</div>
			</CardContent>
		</Card>
	);
}
