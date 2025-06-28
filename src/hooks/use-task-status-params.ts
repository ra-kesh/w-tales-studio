import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from "nuqs";

export function useTaskStatusParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      taskStatusId: parseAsString,
      createTaskStatus: parseAsBoolean,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}
