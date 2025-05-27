import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getConfigs } from "@/lib/db/queries";
import { cn, getGreeting } from "@/lib/utils";
import type { Session } from "@/types/auth";
import {
	ArrowRight,
	Building2,
	CheckCircle,
	Package,
	Target,
} from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	completed: boolean;
	action: {
		label: string;
		href: string;
	};
}

const GettingStarted = async ({ session }: { session: Session }) => {
	const packageTypes = await getConfigs(
		session?.session?.activeOrganizationId as string,
		"package_type",
	);

	const onboardingSteps: OnboardingStep[] = [
		{
			id: "organization",
			title: "Set up your organization",
			description: "Create and configure your organization profile",
			icon: <Building2 className="h-5 w-5" />,
			completed: !!session?.session?.activeOrganizationId,
			action: {
				label: "Configure Organization",
				href: "/settings/organization",
			},
		},
		{
			id: "packages",
			title: "Configure package types",
			description: "Set up your service packages and pricing",
			icon: <Package className="h-5 w-5" />,
			completed: !!packageTypes.length,
			action: {
				label: "Add Packages",
				href: "/configurations/packages",
			},
		},
	];

	const completedSteps = onboardingSteps.filter(
		(step) => step.completed,
	).length;
	const isOnboardingComplete = completedSteps >= 2; // At least org + packages
	const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

	const isOwnerOrAdmin =
		session?.user?.role === "owner" || session?.user?.role === "admin";

	return (
		<div>
			{isOwnerOrAdmin && !isOnboardingComplete ? (
				<Card className="mb-8 border-2 border-dashed border-primary/20 bg-primary/5">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<Target className="h-5 w-5 text-primary" />
									Complete Setup
								</CardTitle>
								<CardDescription>
									Finish setting up your studio to unlock all features
								</CardDescription>
							</div>
							<Badge variant="secondary">
								{completedSteps}/{onboardingSteps.length} completed
							</Badge>
						</div>
						<div className="mt-4">
							<Progress value={progressPercentage} className="h-2" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{onboardingSteps.map((step) => (
								<div
									key={step.id}
									className={cn(
										"flex items-center gap-4 p-4 rounded-lg border transition-all",
										step.completed
											? "bg-green-50 border-green-200"
											: "bg-background border-border hover:border-primary/50",
									)}
								>
									<div
										className={cn(
											"flex items-center justify-center w-10 h-10 rounded-full",
											step.completed
												? "bg-green-500 text-white"
												: "bg-primary/10 text-primary",
										)}
									>
										{step.completed ? (
											<CheckCircle className="h-5 w-5" />
										) : (
											step.icon
										)}
									</div>
									<div className="flex-1">
										<h4 className="font-semibold">{step.title}</h4>
										<p className="text-sm text-muted-foreground">
											{step.description}
										</p>
									</div>
									{!step.completed && (
										<Link href={step.action.href}>
											<Button size="sm" variant="outline">
												{step.action.label}
												<ArrowRight className="h-4 w-4 ml-1" />
											</Button>
										</Link>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="mb-8">
					<h1 className="text-2xl font-semibold tracking-tight mb-2">
						{getGreeting()}, {session?.user?.name?.split(" ")[0] || "there"}! 👋
					</h1>
					<p className="text-muted-foreground text-md">
						Here's what needs your attention today.
					</p>
				</div>
			)}
		</div>
	);
};

export default GettingStarted;
