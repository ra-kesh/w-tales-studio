import React, { Suspense } from "react";
import Bookingform from "./_components/booking-from";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { getServerSession } from "@/lib/dal";

const NewBooking = async () => {
	const { session } = await getServerSession();

	const queryClient = new QueryClient();

	return (
		<div className="flex items-center justify-center p-4 pt-0">
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense>
					<Bookingform />
				</Suspense>
			</HydrationBoundary>
		</div>
	);
};

export default NewBooking;
