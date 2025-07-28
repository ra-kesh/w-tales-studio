import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useBookingParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			updateBookingId: parseAsString,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
