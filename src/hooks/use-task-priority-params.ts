import {
	parseAsArrayOf,
	parseAsBoolean,
	parseAsString,
	useQueryStates,
} from "nuqs";

export function useTaskPriorityParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			taskPriorityId: parseAsString,
			createTaskPriority: parseAsBoolean,
		},
		options,
	);

	return {
		...params,
		setParams,
	};
}
