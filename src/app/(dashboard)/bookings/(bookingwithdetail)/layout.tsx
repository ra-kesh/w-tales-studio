const BookingLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex ">
			<h1>Booking Layout</h1>
			<div>{children}</div>
		</div>
	);
};

export default BookingLayout;
