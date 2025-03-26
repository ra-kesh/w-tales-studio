"use server";

import { auth } from "@/lib/auth";
import type { ActionState } from "@/lib/auth/middleware";
import { validatedAction } from "@/lib/auth/middleware";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signIn = validatedAction(
	signInSchema,
	async (data, formData): Promise<ActionState> => {
		const { email, password } = data;

		try {
			const response = await auth.api.signInEmail({
				body: {
					email,
					password,
				},
				asResponse: true,
			});

			if (!response.ok) {
				return {
					error: "Invalid email or password. Please try again.",
					email,
					password,
				};
			}

			// Return success state first, then redirect
			return {
				error: "",
				redirect: "/projects", // Add redirect path to state
			};
		} catch (error) {
			return {
				error: "An error occurred during sign in",
			};
		}
	},
);

const signUpSchema = z.object({
	name: z.string().min(2).max(50),
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signUp = validatedAction(
	signUpSchema,
	async (data, formData): Promise<ActionState> => {
		const { name, email, password } = data;
		try {
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
				};
			}

			return {
				error: "",
				redirect: "/projects",
			};
		} catch (error) {
			return {
				error: "An error occurred during sign up",
			};
		}
	},
);
