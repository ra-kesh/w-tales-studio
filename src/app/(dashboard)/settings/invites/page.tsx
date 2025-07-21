import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Protected } from "@/app/restricted-to-roles";
import { auth } from "@/lib/auth";
import { TeamInvites } from "../_components/team-invites";

export default async function TeamPage() {
	const organization = await auth.api
		.getFullOrganization({
			headers: await headers(),
		})
		.catch((e) => {
			console.log(e);
			throw redirect("/sign-in");
		});

	return (
		<Protected permissions={{ settings_invites: ["read"] }}>
			<TeamInvites
				activeOrganization={JSON.parse(JSON.stringify(organization))}
			/>
		</Protected>
	);
}
