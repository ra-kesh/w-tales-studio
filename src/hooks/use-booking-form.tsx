"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
	type BookingFormValues,
	BookingSchema,
	defaultBooking,
} from "@/app/(dashboard)/bookings/_components/booking-form/booking-form-schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TABS = ["details", "payments", "shoots", "deliverables"] as const;
type Tab = (typeof TABS)[number];

const TAB_FIELD_MAPPING: Record<Tab, string[]> = {
	details: [
		"bookingName",
		"bookingType",
		"packageType",
		"packageCost",
		"participants",
		"note",
	],
	payments: ["payments", "scheduledPayments"],
	shoots: ["shoots"],
	deliverables: ["deliverables"],
};

export function useBookingForm({
	defaultValues = defaultBooking,
	onSubmit,
	mode = "add",
}: {
	defaultValues?: BookingFormValues;
	onSubmit: (data: BookingFormValues) => void;
	mode?: "add" | "edit";
}) {
	const form = useForm<BookingFormValues>({
		resolver: zodResolver(BookingSchema),
		defaultValues,
		mode: "onChange",
	});

	const detailsTabRef = useRef<HTMLButtonElement>(null);
	const paymentsTabRef = useRef<HTMLButtonElement>(null);
	const deliverablesTabRef = useRef<HTMLButtonElement>(null);
	const shootsTabRef = useRef<HTMLButtonElement>(null);

	const tabRefs = {
		details: detailsTabRef,
		payments: paymentsTabRef,
		deliverables: deliverablesTabRef,
		shoots: shootsTabRef,
	};

	const [activeTab, setActiveTab] = useQueryState("tab", {
		defaultValue: "details",
		parse: (value) => (TABS.includes(value as Tab) ? value : "details"),
	});

	const [tabsWithErrors, setTabsWithErrors] = React.useState<
		Record<string, boolean>
	>({});

	useEffect(() => {
		if (form.formState.errors) {
			const errorFields = Object.keys(form.formState.errors);
			const newTabsWithErrors = TABS.reduce((acc, tab) => {
				const hasError = errorFields.some((field) =>
					TAB_FIELD_MAPPING[tab].some(
						(tabField) =>
							field === tabField || field.startsWith(`${tabField}.`),
					),
				);
				return { ...acc, [tab]: hasError };
			}, {});
			setTabsWithErrors(newTabsWithErrors);
		}
	}, [form.formState.errors, form]);

	useEffect(() => {
		if (form.formState.isSubmitSuccessful && mode === "add") {
			form.reset({ ...defaultBooking });
			setActiveTab("details");
		}
	}, [form.formState.isSubmitSuccessful, form.reset, mode, setActiveTab, form]);

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
		if (TABS.includes(newTab as Tab)) {
			setActiveTab(newTab);
		}
	};

	const goToNextTab = () => {
		const currentIndex = TABS.indexOf(activeTab as Tab);
		if (currentIndex < TABS.length - 1) {
			handleTabChange(TABS[currentIndex + 1]);
		}
	};

	const goToPreviousTab = () => {
		const currentIndex = TABS.indexOf(activeTab as Tab);
		if (currentIndex > 0) {
			handleTabChange(TABS[currentIndex - 1]);
		}
	};

	const isFirstTab = TABS.indexOf(activeTab as Tab) === 0;
	const isLastTab = TABS.indexOf(activeTab as Tab) === TABS.length - 1;

	const ErrorSummary = () => {
		if (!form.formState.isSubmitted || form.formState.isValid) return null;

		return (
			<Alert variant="destructive" className="mb-4">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Validation Errors</AlertTitle>
				<AlertDescription>
					Please fix the errors on the indicated tabs before submitting.
					<ul className="mt-2 list-disc pl-5">
						{TABS.map((tab) =>
							tabsWithErrors[tab] ? (
								<li key={tab}>
									<button
										type="button"
										className="capitalize text-primary underline"
										onClick={() => handleTabChange(tab)}
									>
										{tab} Tab
									</button>
								</li>
							) : null,
						)}
					</ul>
				</AlertDescription>
			</Alert>
		);
	};

	return {
		form,
		activeTab,
		handleTabChange,
		goToNextTab,
		goToPreviousTab,
		isFirstTab,
		isLastTab,
		ErrorSummary,
		handleSubmit: form.handleSubmit(onSubmit),
		TABS,
		detailsTabRef,
		paymentsTabRef,
		deliverablesTabRef,
		shootsTabRef,
		tabRefs,
	};
}
