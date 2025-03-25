import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const fetchCallback = ({
  setIsPending,
  onError,
}: {
  setIsPending: (value: boolean) => void;
  onError?: (error: Error) => void;
}) => {
  return {
    onRequest: () => {
      setIsPending(true);
    },
    onResponse: () => {
      setIsPending(false);
    },
    onError: (error: Error) => {
      onError?.(error);
      setIsPending(false);
    },
  };
};
