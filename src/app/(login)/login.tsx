"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ActionState } from "@/lib/auth/middleware";
import { signIn, signUp } from "./action";
import { toast } from "sonner";

export function Login({
	mode = "signin",
	className,
	...props
}: React.ComponentProps<"div"> & {
	mode?: "signin" | "signup";
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");
	const priceId = searchParams.get("priceId");
	const inviteId = searchParams.get("inviteId");

	const [state, formAction, pending] = useActionState<ActionState, FormData>(
		async (state: ActionState, formData: FormData): Promise<ActionState> => {
			const result =
				mode === "signin"
					? await signIn(state, formData)
					: await signUp(state, formData);

			return result || state;
		},
		{ error: "" },
	);

	// useEffect(() => {
	// 	authClient.oneTap({
	// 		onPromptNotification: (notification) => {
	// 			toast.error(
	// 				"Prompt was dismissed or skipped. Consider displaying an alternative sign-in option.",
	// 				notification,
	// 			);
	// 		},
	// 		fetchOptions: {
	// 			onError: ({ error }) => {
	// 				toast.error(error.message || "An error occurred");
	// 			},
	// 			onSuccess: () => {
	// 				toast.success("Successfully signed in");
	// 				router.push("/dashboard");
	// 			},
	// 		},
	// 	});
	// }, []);

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">
						{mode === "signin" ? "Welcome back" : "Create an account"}
					</CardTitle>
					<CardDescription>
						{" "}
						{mode === "signin"
							? "Sign in with your Google account"
							: "Signup with your Google account"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6">
						<div className="flex flex-col gap-4">
							<Button
								variant="outline"
								type="button"
								className={cn("w-full gap-2")}
								onClick={async () => {
									await authClient.signIn.social({
										provider: "google",
										callbackURL: "/dashboard",
									});
								}}
							>
								{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="0.98em"
									height="1em"
									viewBox="0 0 256 262"
								>
									<path
										fill="#4285F4"
										d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
									/>
									<path
										fill="#34A853"
										d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
									/>
									<path
										fill="#FBBC05"
										d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
									/>
									<path
										fill="#EB4335"
										d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
									/>
								</svg>
								Sign in with Google
							</Button>
						</div>
						<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
							<span className="bg-card text-muted-foreground relative z-10 px-2">
								Or continue with
							</span>
						</div>
						<form action={formAction}>
							<div className="grid gap-6">
								{mode === "signup" && (
									<div className="grid gap-3">
										<Label htmlFor="name">Name</Label>
										<Input
											id="name"
											name="name"
											type="text"
											autoComplete="name"
											placeholder="Enter your name"
											required
											defaultValue={state.name as string}
											maxLength={50}
										/>
									</div>
								)}

								<div className="grid gap-3">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										defaultValue={state.email as string}
										type="email"
										autoComplete="email"
										required
										maxLength={50}
										placeholder="m@example.com"
									/>
								</div>
								<div className="grid gap-3">
									<div className="flex items-center">
										<Label htmlFor="password">Password</Label>
										<a
											href="/forgot-password"
											className="ml-auto text-sm underline-offset-4 hover:underline"
										>
											Forgot your password?
										</a>
									</div>
									<Input
										id="password"
										name="password"
										type="password"
										defaultValue={state.password as string}
										autoComplete={
											mode === "signin" ? "current-password" : "new-password"
										}
										required
										minLength={8}
										maxLength={100}
										placeholder="Enter your password"
									/>
								</div>
								{state?.error && (
									<div className="text-red-500 text-sm">{state.error}</div>
								)}

								<Button type="submit" className="w-full" disabled={pending}>
									{pending ? (
										<>
											<Loader2 className="animate-spin mr-2 h-4 w-4" />
											Loading...
										</>
									) : mode === "signin" ? (
										"Sign in"
									) : (
										"Sign up"
									)}
								</Button>
							</div>

							<div className="text-center text-sm">
								<>
									{mode === "signin"
										? "Don't have an account? "
										: "Already have an account? "}
									<Link
										href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
											redirect ? `?redirect=${redirect}` : ""
										}`}
										className="underline underline-offset-4"
									>
										{mode === "signin" ? "SignUp" : "SignIn"}
									</Link>
								</>
							</div>
						</form>
					</div>
				</CardContent>
			</Card>
			<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
				By clicking continue, you agree to our <a href="/">Terms of Service</a>{" "}
				and <a href="/">Privacy Policy</a>.
			</div>
		</div>
	);
}
