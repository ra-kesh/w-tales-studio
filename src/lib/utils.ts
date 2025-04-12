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
		href: `/${paths.slice(0, index + 1).join("/")}`,
		label: path
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" "),
		isLast: index === paths.length - 1,
	}));
}

type Primitive = string | number | boolean | null | undefined;
type PlainObject = { [key: string]: Data };
type Data = Primitive | PlainObject | Data[];

export function sanitizeEmptiness<T extends Data>(data: T): T {
	if (Array.isArray(data)) {
		const filteredArray = data.filter((item) => !isEmpty(item));
		return filteredArray.map((item) => sanitizeEmptiness(item)) as T;
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (typeof data === "object" && data !== null) {
		const newData: PlainObject = {};
		for (const key in data) {
			const value = data[key];
			if (!isEmpty(value)) {
				const cleanedValue = sanitizeEmptiness(value);
				if (!isEmpty(cleanedValue)) {
					newData[key] = cleanedValue;
				}
			}
		}
		return newData as T;
	}
	return data;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const isEmpty = (value: any): boolean => {
	if (value === null || value === undefined) {
		return true;
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (typeof value === "object") {
		if (Array.isArray(value)) {
			return value.length === 0;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			return Object.keys(value).length === 0;
		}
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (typeof value === "string") {
		return value.trim() === "";
	}
	return false;
};
