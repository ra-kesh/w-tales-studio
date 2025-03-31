import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db } from "../db/drizzle";
import { admin, organization, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getActiveOrganization } from "../db/queries";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},

	plugins: [
		username(),
		admin(),
		organization({
			//todo: add custom logic later based on subscription
			allowUserToCreateOrganization: true,
		}),
		nextCookies(),
	],
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					const organization = await getActiveOrganization(session.userId);
					return {
						data: {
							...session,
							activeOrganizationId: organization.organizationId,
						},
					};
				},
			},
		},
	},
	disabledPaths: ["/sign-up/email", "/sign-in/email"],
});
