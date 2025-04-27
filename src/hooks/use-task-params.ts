import {
	parseAsArrayOf,
	parseAsBoolean,
	parseAsString,
	useQueryStates,
} from "nuqs";

export function useTaskParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			taskId: parseAsString,
			createTask: parseAsBoolean,
			sort: parseAsArrayOf(parseAsString),
			name: parseAsString,
			q: parseAsString,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
