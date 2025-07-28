import type { z } from "zod/v4";

export type ActionState = {
	error?: string;
	success?: string;
	[key: string]: unknown; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<unknown>, T> = (
	data: z.infer<S>,
	formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<unknown>, T>(
	schema: S,
	action: ValidatedActionFunction<S, T>,
) {
	return async (prevState: ActionState, formData: FormData): Promise<T> => {
		const result = schema.safeParse(Object.fromEntries(formData));
		if (!result.success) {
			return { error: result.error.issues[0].message } as T;
		}

		return action(result.data, formData);
	};
}
