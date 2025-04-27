import {
	parseAsArrayOf,
	parseAsBoolean,
	parseAsString,
	useQueryStates,
} from "nuqs";

export function useExpenseParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			expenseId: parseAsString,
			createExpense: parseAsBoolean,
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
