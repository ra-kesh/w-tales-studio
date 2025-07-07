import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";
import { auth } from "@/lib/auth";

interface ProtectedProps {
	children: React.ReactNode;
	permissions: { [key: string]: string[] };
	fallback?: React.ReactNode;
	redirectPath?: string;
}

export async function Protected({
	children,
	permissions,
	fallback,
	redirectPath = "/not-found",
}: ProtectedProps) {
	const hasAccess = await auth.api.hasPermission({
		headers: await headers(),
		body: {
			permissions,
		},
	});

	console.log({ hasAccess });

	if (hasAccess.success) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	redirect(redirectPath);

	// This part is unreachable due to the redirect, but keeps TypeScript happy.
	return null;
}
