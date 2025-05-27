import { auth } from "@/lib/auth";
import { getGreeting } from "@/lib/utils";
import { Building2, Package } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GettingStarted from "./getting-started";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
	const [
		session,

		organization,
	] = await Promise.all([
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

	console.log("HomeLayout session", session);

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl">
			<GettingStarted session={JSON.parse(JSON.stringify(session))} />

			{children}
		</div>
	);
};

export default HomeLayout;
