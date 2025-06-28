import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useDeliverableStatusParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      deliverableStatusId: parseAsString,
      createDeliverableStatus: parseAsBoolean,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}
