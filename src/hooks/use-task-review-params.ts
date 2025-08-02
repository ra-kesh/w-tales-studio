import { parseAsString, useQueryStates } from "nuqs";

export function useTaskReviewParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			reviewTaskId: parseAsString,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
