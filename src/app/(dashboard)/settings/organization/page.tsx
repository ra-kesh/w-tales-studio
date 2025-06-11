import { auth } from "@/lib/auth";
import { OrganizationSettings } from "../_components/organization-settings";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function OrganizationPage() {
  const [session, activeSessions, deviceSessions, organization] =
    await Promise.all([
      auth.api.getSession({
        headers: await headers(),
      }),
      auth.api.listSessions({
        headers: await headers(),
      }),
      auth.api.listDeviceSessions({
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
    <OrganizationSettings
      session={JSON.parse(JSON.stringify(session))}
      activeOrganization={JSON.parse(JSON.stringify(organization))}
    />
  );
}
