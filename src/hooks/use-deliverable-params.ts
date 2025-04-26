import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useDeliverableParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      deliverableId: parseAsString,
      createDeliverable: parseAsBoolean,
      sort: parseAsArrayOf(parseAsString),
      name: parseAsString,
      q: parseAsString,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}
