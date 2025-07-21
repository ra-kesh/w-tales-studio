import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useBookingParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			updateBooking: parseAsBoolean,
			bookingId: parseAsString,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
