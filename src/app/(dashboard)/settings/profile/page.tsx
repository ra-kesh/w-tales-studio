import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserProfile } from "../_components/user-profile";

export default async function UserProfilePage() {
	const [session, activeSessions] = await Promise.all([
		auth.api.getSession({
			headers: await headers(),
		}),
		auth.api.listSessions({
			headers: await headers(),
		}),
	]).catch((e) => {
		console.log(e);
		throw redirect("/sign-in");
	});
	return (
		<UserProfile
			session={JSON.parse(JSON.stringify(session))}
			activeSessions={JSON.parse(JSON.stringify(activeSessions))}
		/>
	);
}
