import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const NewBookingButton = () => {
	return (
		<Link
			href={{
				pathname: "/bookings/add",
				query: { tab: "details" },
			}}
			prefetch={true}
		>
			<Button
				size="sm"
				className="bg-indigo-600  font-semibold text-white  hover:bg-indigo-500 cursor-pointer"
			>
				New Booking
			</Button>
		</Link>
	);
};

export default NewBookingButton;
