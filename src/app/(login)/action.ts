"use server";

import { auth } from "@/lib/auth";
import { validatedAction } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
	const { email, password } = data;

	const response = await auth.api.signInEmail({
		body: { email, password },
		asResponse: true,
	});

	if (!response.ok) {
		return {
			error: "Invalid email or password. Please try again.",
			email,
			password,
		};
	}

	const redirectTo = formData.get("redirect") as string | null;

	console.log({ redirectTo });

	if (redirectTo) {
		redirect(`${redirectTo}`);
	}

	redirect("/home");
});

const signUpSchema = z.object({
	name: z.string().min(2).max(50),
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
	const { name, email, password } = data;
	const response = await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
		},
		asResponse: true,
	});

	if (!response.ok) {
		return {
			error: "Failed to create account",
			name,
			email,
			password,
		};
	}

	const redirectTo = formData.get("redirect") as string | null;

	if (redirectTo) {
		redirect(`${redirectTo}`);
	}

	redirect("/home");
});
