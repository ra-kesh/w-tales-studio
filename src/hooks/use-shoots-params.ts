import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useShootsParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      shootId: parseAsString,
      createShoot: parseAsBoolean,
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
