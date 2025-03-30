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

export function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split("/").filter(Boolean);
  return paths.map((path, index) => ({
    href: "/" + paths.slice(0, index + 1).join("/"),
    label: path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    isLast: index === paths.length - 1,
  }));
}
