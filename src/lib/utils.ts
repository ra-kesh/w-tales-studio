import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
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

export function generateKey(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
		.trim()
		.replace(/[\s-]+/g, "_"); // Replace both spaces and hyphens with underscores
}

export function formatDate(date: Date | string | number | undefined) {
	if (!date) return "";

	try {
		return format(new Date(date), "EEEE, MMM dd, yyyy");
	} catch (_err) {
		return "";
	}
}

export const getGreeting = () => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
};

export async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export const formatCurrency = (value: string | number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(Number(value));
};

export const isUrl = (text: string): boolean => {
	try {
		new URL(text);
		return true;
	} catch {
		return false;
	}
};
