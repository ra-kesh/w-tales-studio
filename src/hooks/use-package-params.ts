import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function usePackageParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      packageId: parseAsString,
      createPackage: parseAsBoolean,
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
