import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrganizationSetup } from "./organization-setup";
import { headers } from "next/headers";
import type { User } from "@/lib/db/schema";

export default async function SetupPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	console.log(session);

	if (!session) {
		redirect("/sign-in");
	}

	if (session?.session?.activeOrganizationId) {
		redirect("/dashboard");
	}

	return (
		<div className="flex justify-center items-center w-full h-dvh">
			<div className="container max-w-lg py-10">
				<OrganizationSetup user={session.user as User} />
			</div>
		</div>
	);
}
