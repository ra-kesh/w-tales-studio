"use client";

import { useSession } from "@/lib/auth/auth-client";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Calendar,
	CheckCircle,
	ArrowRight,
	Clock,
	AlertCircle,
	Target,
	Building2,
	Package,
	UserPlus,
	Camera,
	FileText,
	User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePackageTypes } from "@/hooks/use-configs";

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

interface AssignedItem {
	id: string;
	title: string;
	description: string;
	type: "shoot" | "task" | "deliverable";
	priority: "high" | "medium" | "low";
	dueDate?: string;
	status: "pending" | "in-progress" | "review";
	href: string;
}

export default function HomePage() {
	const { data: session } = useSession();

	const { data: packageTypes = [] } = usePackageTypes();

	//  Get current time for personalized greeting
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	// Check if user is owner or admin (for getting started section)
	const isOwnerOrAdmin = true; // This would come from user role check

	// Onboarding steps - only show to owners/admins
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
			completed: packageTypes.length > 0,
			action: {
				label: "Add Packages",
				href: "/configurations/packages",
			},
		},
	];

	// Mock assigned items - in real app, this would come from API based on user
	const assignedItems: AssignedItem[] = [
		// This would be populated with user-specific assigned tasks, shoots, deliverables
	];

	const completedSteps = onboardingSteps.filter(
		(step) => step.completed,
	).length;
	const isOnboardingComplete = completedSteps >= 2; // At least org + packages
	const progressPercentage = (completedSteps / onboardingSteps.length) * 100;

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "bg-red-100 text-red-800 border-red-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "shoot":
				return <Camera className="h-4 w-4" />;
			case "task":
				return <FileText className="h-4 w-4" />;
			case "deliverable":
				return <Package className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	return (
		<div>
			{/* Personalized Greeting */}

			{/* Getting Started Section - Only for Owners/Admins */}
			{isOwnerOrAdmin && !isOnboardingComplete && (
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
			)}

			{/* My Assignments */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Today's Shoots */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Camera className="h-5 w-5" />
							Today's Shoots
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-6 text-muted-foreground">
							<Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm">No shoots scheduled</p>
						</div>
					</CardContent>
				</Card>

				{/* Pending Tasks */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<FileText className="h-5 w-5" />
							My Tasks
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-6 text-muted-foreground">
							<FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm">All caught up!</p>
						</div>
					</CardContent>
				</Card>

				{/* Pending Deliverables */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Package className="h-5 w-5" />
							Deliverables
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-6 text-muted-foreground">
							<Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p className="text-sm">Nothing pending</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="mt-8">
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="flex gap-3 flex-wrap">
					<Link href="/dashboard">
						<Button variant="outline">View Full Dashboard</Button>
					</Link>
					<Link href="/bookings/add">
						<Button variant="outline">New Booking</Button>
					</Link>
					<Link href="/shoots">
						<Button variant="outline">Schedule Shoot</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
