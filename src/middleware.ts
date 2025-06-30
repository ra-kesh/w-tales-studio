import { createAuthClient } from "better-auth/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const client = createAuthClient();

export async function middleware(request: NextRequest) {
	const { data: session } = await client.getSession({
		fetchOptions: {
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		},
	});

	if (!session) {
		return NextResponse.redirect(new URL("/sign-in", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin",
		"/home",
		"/bookings/:path*",
		"/dashboard/:path*",
		"/clients/:path*",
		"/deliverables/:path*",
		"/expenses/:path*",
		"/shoots/:path*",
		"/tasks/:path*",
		"/teams/:path*",
		"/configurations/:path*",
		"/settings/:path*",
	],
};
