"use client";

import React, { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingDetailForm } from "./booking-detail-form";
import {
	type BookingFormValues,
	BookingSchema,
	defaultBooking,
} from "./booking-form-schema";
import { ShootDetailForm } from "./shoot-detail-form";
import { BookingDeliveryForm } from "./booking-delivery-form";
import { BookingPaymentForm } from "./booking-payment-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useQueryState } from "nuqs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BookingForm = ({
	defaultValues,
	onSubmit,
	isPending,
	mode = "add",
}: {
	defaultValues: BookingFormValues;
	onSubmit: (data: BookingFormValues) => void;
	isPending?: boolean;
	mode?: "add" | "edit";
}) => {
	const form = useForm<BookingFormValues>({
		resolver: zodResolver(BookingSchema),
		defaultValues: defaultValues,
		mode: "onChange",
	});

	const router = useRouter();

	const detailsTabRef = useRef<HTMLButtonElement>(null);
	const paymentsTabRef = useRef<HTMLButtonElement>(null);
	const deliverablesTabRef = useRef<HTMLButtonElement>(null);
	const shootsTabRef = useRef<HTMLButtonElement>(null);

	const tabOrder = ["details", "payments", "shoots", "deliverables"];

	const tabRefs = {
		details: detailsTabRef,
		payments: paymentsTabRef,
		deliverables: deliverablesTabRef,
		shoots: shootsTabRef,
	};

	// Replace the searchParams and createQueryString with nuqs
	const [activeTab, setActiveTab] = useQueryState("tab", {
		defaultValue: "details",
		parse: (value) => {
			return tabOrder.includes(value) ? value : "details";
		},
		serialize: (value) => value,
	});

	// Track which tabs have errors
	const [tabsWithErrors, setTabsWithErrors] = React.useState<
		Record<string, boolean>
	>({});

	// Update tabs with errors whenever form state changes
	React.useEffect(() => {
		if (form.formState.errors) {
			const errorFields = Object.keys(form.formState.errors);

			// Map to determine which fields belong to which tabs
			const tabFieldMapping: Record<string, string[]> = {
				details: [
					"bookingName",
					"bookingType",
					"packageType",
					"packageCost",
					"clientName",
					"groomName",
					"brideName",
					"address",
					"relation",
					"phone",
					"email",
					"note",
				],
				payments: ["payments", "scheduledPayments"],
				shoots: ["shoots"],
				deliverables: ["deliverables"],
			};

			// Check which tabs have errors
			const newTabsWithErrors = tabOrder.reduce((acc, tab) => {
				const hasError = errorFields.some((field) => {
					// Check if the field or its parent belongs to this tab
					return tabFieldMapping[tab].some(
						(tabField) =>
							field === tabField || field.startsWith(`${tabField}.`),
					);
				});

				return { ...acc, [tab]: hasError };
			}, {});

			setTabsWithErrors(newTabsWithErrors);
		}
	}, [form.formState.errors]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				(e.key === "ArrowLeft" || e.key === "ArrowRight") &&
				e.target instanceof HTMLElement &&
				!["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
			) {
				const isSomeTabFocused = Object.values(tabRefs).some(
					(ref) => ref.current === document.activeElement,
				);

				if (!isSomeTabFocused) {
					e.preventDefault();
					const activeTabRef = tabRefs[activeTab as keyof typeof tabRefs];
					if (activeTabRef?.current) {
						activeTabRef.current.focus();
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeTab]);

	const handleTabChange = (newTab: string) => {
		setActiveTab(newTab);
	};

	const goToPreviousTab = () => {
		const currentIndex = tabOrder.indexOf(activeTab);
		if (currentIndex > 0) {
			handleTabChange(tabOrder[currentIndex - 1]);
		}
	};

	const goToNextTab = () => {
		const currentIndex = tabOrder.indexOf(activeTab);
		if (currentIndex < tabOrder.length - 1) {
			handleTabChange(tabOrder[currentIndex + 1]);
		}
	};

	const isFirstTab = tabOrder.indexOf(activeTab) === 0;
	const isLastTab = tabOrder.indexOf(activeTab) === tabOrder.length - 1;

	// Get a summary of all errors
	const getErrorSummary = () => {
		const errors = form.formState.errors;
		if (!errors || Object.keys(errors).length === 0) return null;

		// Count errors by tab
		const errorsByTab = tabOrder.reduce(
			(acc, tab) => {
				const count = Object.keys(tabsWithErrors).filter(
					(t) => t === tab && tabsWithErrors[t],
				).length;
				if (count > 0) acc[tab] = count;
				return acc;
			},
			{} as Record<string, number>,
		);

		if (Object.keys(errorsByTab).length === 0) return null;

		return (
			<Alert variant="destructive" className="mb-4">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Validation Errors</AlertTitle>
				<AlertDescription>
					Please fix the following errors before submitting:
					<ul className="mt-2 list-disc pl-5">
						{Object.keys(tabsWithErrors).map((tab) =>
							tabsWithErrors[tab] ? (
								<li key={tab} className="text-sm">
									<button
										type="button"
										className="text-primary underline"
										onClick={() => handleTabChange(tab)}
									>
										{tab.charAt(0).toUpperCase() + tab.slice(1)} tab
									</button>
								</li>
							) : null,
						)}
					</ul>
				</AlertDescription>
			</Alert>
		);
	};

	React.useEffect(() => {
		if (form.formState.isSubmitSuccessful && mode === "add") {
			form.reset({ ...defaultBooking });
			handleTabChange("details");
		}
	}, [form.formState, form.reset, mode]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="container max-w-5xl py-8"
			>
				{/* Error Summary */}
				{form.formState.isSubmitted && getErrorSummary()}

				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger
							ref={detailsTabRef}
							value="details"
							className="relative"
						>
							Details
							
						</TabsTrigger>
						<TabsTrigger
							ref={paymentsTabRef}
							value="payments"
							className="relative"
						>
							Payments
					
						</TabsTrigger>
						<TabsTrigger ref={shootsTabRef} value="shoots" className="relative">
							Shoots
					
						</TabsTrigger>
						<TabsTrigger
							ref={deliverablesTabRef}
							value="deliverables"
							className="relative"
						>
							Deliverables
							
						</TabsTrigger>
					</TabsList>

					<TabsContent value="details" className="space-y-4">
						<BookingDetailForm />
					</TabsContent>

					<TabsContent value="payments" className="space-y-4">
						<BookingPaymentForm />
					</TabsContent>

					<TabsContent value="shoots" className="space-y-4">
						<ShootDetailForm />
					</TabsContent>

					<TabsContent value="deliverables" className="space-y-4">
						<BookingDeliveryForm />
					</TabsContent>
				</Tabs>

				<div className="flex justify-between">
					<div className="flex items-center gap-4">
						<Button
							type="button"
							variant={"outline"}
							onClick={goToPreviousTab}
							disabled={isFirstTab}
						>
							Previous
						</Button>
						<Button
							type="button"
							variant={"outline"}
							onClick={goToNextTab}
							disabled={isLastTab}
						>
							Next
						</Button>
					</div>
					<div className="flex items-center gap-4">
						<Button
							variant={"secondary"}
							type="button"
							onClick={() => router.back()}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default BookingForm;
