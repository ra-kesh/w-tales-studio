import {
	parseAsArrayOf,
	parseAsBoolean,
	parseAsString,
	useQueryStates,
} from "nuqs";

export function useCrewParams(options?: { shallow: boolean }) {
	const [params, setParams] = useQueryStates(
		{
			crewId: parseAsString,
			createCrew: parseAsBoolean,
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
