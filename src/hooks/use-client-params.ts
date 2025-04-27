import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useClientParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      clientId: parseAsString,
      createClient: parseAsBoolean,
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
