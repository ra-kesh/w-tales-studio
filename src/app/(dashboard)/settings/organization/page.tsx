import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Protected } from "@/app/restricted-to-roles";
import { auth } from "@/lib/auth";
import { OrganizationSettings } from "../_components/organization-settings";

export default async function OrganizationPage() {
	const [session, organization] = await Promise.all([
		auth.api.getSession({
			headers: await headers(),
		}),

		auth.api.getFullOrganization({
			headers: await headers(),
		}),
	]).catch((e) => {
		console.log(e);
		throw redirect("/sign-in");
	});

	return (
		<Protected permissions={{ settings_organization: ["read"] }}>
			<OrganizationSettings
				session={JSON.parse(JSON.stringify(session))}
				activeOrganization={JSON.parse(JSON.stringify(organization))}
			/>
		</Protected>
	);
}
