"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookingForm } from "@/hooks/use-booking-form";
import { BookingDeliveryForm } from "./booking-delivery-form";
import { BookingDetailForm } from "./booking-detail-form";
import type { BookingFormValues } from "./booking-form-schema";
import { BookingPaymentForm } from "./booking-payment-form";
import { ShootDetailForm } from "./shoot-detail-form";

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
	const router = useRouter();

	const {
		form,
		activeTab,
		handleTabChange,
		goToNextTab,
		goToPreviousTab,
		isFirstTab,
		isLastTab,
		ErrorSummary,
		handleSubmit,
		TABS,
		tabRefs,
	} = useBookingForm({ defaultValues, onSubmit, mode });

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit} className="container max-w-6xl">
				<ErrorSummary />

				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-4">
						{TABS.map((tab) => (
							<TabsTrigger
								ref={tabRefs[tab]}
								key={tab}
								value={tab}
								className="capitalize"
							>
								{tab}
							</TabsTrigger>
						))}
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
