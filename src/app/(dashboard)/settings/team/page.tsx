import { auth } from "@/lib/auth";
import { TeamInvites } from "../_components/team-invites";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
		<TeamInvites
			activeOrganization={JSON.parse(JSON.stringify(organization))}
		/>
	);
}
