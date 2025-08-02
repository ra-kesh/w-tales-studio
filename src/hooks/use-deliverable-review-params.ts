import { parseAsString, useQueryStates } from "nuqs";

export function useDeliverableReviewParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			reviewDeliverableId: parseAsString,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
