import {
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function usePaymentsParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      createReceivedPayment: parseAsBoolean,
      receivedPaymentId: parseAsString,
      createScheduledPayment: parseAsBoolean,
      scheduledPaymentId: parseAsString,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}
