"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import type { User } from "@/lib/db/schema";

export function OrganizationSetup({ user }: { user: User }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

	async function handleSubmit(formData: FormData) {
		const name = formData.get("name") as string;
		if (!name) return;

		setIsPending(true);
		try {
			const slug = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

			const { data: slugAvailable } = await authClient.organization.checkSlug({
				slug: slug,
			});

			if (slugAvailable?.status) {
				const { data, error } = await authClient.organization.create({
					name,
					slug,
				});

				if (data?.id) {
					toast.success("Studio created successfully!");
					router.push("/dashboard");
				} else {
					toast.error(error?.message);
				}
			} else {
				toast.error("This name is already taken");
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			toast.error(message || "Failed to create studio");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Set up your studio</CardTitle>
			</CardHeader>
			<CardContent>
				<form action={handleSubmit}>
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="name">Studio Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="e.g. Pixel Perfect Photography"
								required
							/>
						</div>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creating..." : "Create Studio"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
