"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, Package, Calendar, Building } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import Link from "next/link";
import { cn } from "@/lib/utils";

import CreateOrganisationDialog from "@/components/create-organisation-dialog";
import { OpenPackageSheet } from "../../configurations/_components/open-package-sheet";
import InviteMemberDialog from "@/components/invite-member-dialog";

interface Step {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	completed: boolean;
	actionComponent?: React.ReactNode; // Optional custom component for actions
}

export function GettingStarted() {
	const { data: onboarding, isLoading } = useOnboarding();

	console.log("Onboarding data:", onboarding);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-4 bg-muted animate-pulse rounded" />
				<div className="h-20 bg-muted animate-pulse rounded" />
				<div className="h-20 bg-muted animate-pulse rounded" />
			</div>
		);
	}

	if (!onboarding) return null;

	const steps: Step[] = [
		{
			id: "organization",
			title: "Organization Setup",
			description: "Setup and configure your organization details",
			icon: Building,
			href: "/settings/organization", // Keep href as a fallback or for navigation if dialog is closed
			completed: onboarding.organizationCreated,
			actionComponent: <CreateOrganisationDialog />, // Add your custom component here
		},
		{
			id: "packages",
			title: "Create Package Types",
			description: "Set up your service packages and pricing",
			icon: Package,
			href: "/configurations/packages",
			completed: onboarding.packageCreated,
			actionComponent: <OpenPackageSheet />,
		},
		{
			id: "booking",
			title: "Create Your First Booking",
			description: "Add your first client booking to get started",
			icon: Calendar,
			href: "/bookings",
			completed: onboarding.bookingCreated,
			actionComponent: (
				<Link
					href={{
						pathname: "/bookings/add",
						query: { tab: "details" },
					}}
					prefetch={true}
				>
					<Button>Add Booking</Button>
				</Link>
			),
		},
		{
			id: "members",
			title: "Invite Team Members",
			description: "Collaborate with your team by inviting members",
			icon: Users,
			href: "/settings/team",
			completed: onboarding.membersInvited,
			actionComponent: <InviteMemberDialog />, // Add custom component if needed
		},
	];

	const nextStep = steps.find((step) => !step.completed);
	const completedSteps = steps.filter((step) => step.completed).length;
	const progressPercentage = (completedSteps / steps.length) * 100;

	if (onboarding.onboarded) {
		return (
			<Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
				<CardHeader className="pb-3">
					<div className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						<CardTitle className="text-green-900 dark:text-green-100">
							Setup Complete!
						</CardTitle>
					</div>
					<CardDescription className="text-green-700 dark:text-green-300">
						Congratulations! You've completed the initial setup. Your studio is
						ready to go.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building className="h-5 w-5" />
						Getting Started
					</CardTitle>
					<CardDescription>
						Complete these steps to set up your studio management system
					</CardDescription>
					<div className="mt-4">
						<div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
							<span>
								{completedSteps} of {steps.length} completed
							</span>
							<span>{Math.round(progressPercentage)}%</span>
						</div>
						<div className="w-full bg-muted rounded-full h-2">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-300"
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{steps.map((step, index) => {
						const Icon = step.icon;
						const isNext = step.id === nextStep?.id;

						return (
							<div
								key={step.id}
								className={cn(
									"flex items-center gap-4 p-4 rounded-lg border transition-all",
									step.completed
										? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
										: isNext
											? "border-primary bg-primary/5 ring-1 ring-primary/20"
											: "border-muted bg-muted/30",
								)}
							>
								<div
									className={cn(
										"flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
										step.completed
											? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
											: isNext
												? "bg-primary text-primary-foreground"
												: "bg-muted text-muted-foreground",
									)}
								>
									{step.completed ? (
										<CheckCircle2 className="h-5 w-5" />
									) : (
										<Icon className="h-5 w-5" />
									)}
								</div>

								<div className="flex-1 min-w-0">
									<h3
										className={cn(
											"font-medium",
											step.completed
												? "text-green-900 dark:text-green-100"
												: isNext
													? "text-foreground"
													: "text-muted-foreground",
										)}
									>
										{step.title}
									</h3>
									<p
										className={cn(
											"text-sm",
											step.completed
												? "text-green-700 dark:text-green-300"
												: isNext
													? "text-muted-foreground"
													: "text-muted-foreground/70",
										)}
									>
										{step.description}
									</p>
								</div>

								{isNext && step.actionComponent && (
									<div>{step.actionComponent}</div>
								)}

								{step.completed && (
									<Button asChild variant="outline" size="sm">
										<Link href={step.href}>View</Link>
									</Button>
								)}
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}
