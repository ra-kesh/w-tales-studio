import { BookingStats } from "./_components/booking-stats";

const BookingLayout = ({ children }: { children: React.ReactNode }) => {
	// Sample stats data as provided in the task
	const stats = {
		totalBookings: "19",
		activeBookings: "19",
		totalExpenses: "65403278.00",
		totalRevenue: "59699.82",
	};

	return (
		<div className="hidden h-full flex-1 flex-col space-y-4 p-8 md:flex">
			<BookingStats stats={stats} />
			<div>{children}</div>
		</div>
	);
};

export default BookingLayout;
