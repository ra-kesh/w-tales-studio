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
				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger ref={detailsTabRef} value="details">
							Details
						</TabsTrigger>
						<TabsTrigger ref={paymentsTabRef} value="payments">
							Payments
						</TabsTrigger>
						<TabsTrigger ref={shootsTabRef} value="shoots">
							Shoots
						</TabsTrigger>
						<TabsTrigger ref={deliverablesTabRef} value="deliverables">
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
