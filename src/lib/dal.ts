import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getServerSession = cache(async () => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.session.userId) {
			redirect("/sign-in");
		}

		return { session };
	} catch (error) {
		return {
			session: null,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
});
