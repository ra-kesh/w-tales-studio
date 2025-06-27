import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useBookingTypesParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      bookingTypeId: parseAsString,
      createBookingType: parseAsBoolean,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}
