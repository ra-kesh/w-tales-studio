import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db } from "../db/drizzle";
import {
	admin,
	multiSession,
	oneTap,
	organization,
	username,
} from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getActiveOrganization } from "../db/queries";
import { resend } from "../email/resend";
import { reactInvitationEmail } from "../email/invitation";

const from = process.env.BETTER_AUTH_EMAIL || "mail@updates.rakyesh.com";
const to = process.env.TEST_EMAIL || "";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	plugins: [
		username(),
		admin(),
		organization({
			async sendInvitationEmail(data) {
				await resend.emails.send({
					from,
					to: data.email,
					subject: "You've been invited to join an organization",
					react: reactInvitationEmail({
						username: data.email,
						invitedByUsername: data.inviter.user.name,
						invitedByEmail: data.inviter.user.email,
						teamName: data.organization.name,
						inviteLink:
							process.env.NODE_ENV === "development"
								? `http://localhost:3000/accept-invitation/${data.id}`
								: `${
										process.env.BETTER_AUTH_URL || "https://wtp.rakyesh.com"
									}/accept-invitation/${data.id}`,
					}),
				});
			},
			//todo: add custom logic later based on subscription
			allowUserToCreateOrganization: true,
		}),
		nextCookies(),
		multiSession(),
		oneTap(),
	],
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "email-password"],
			allowDifferentEmails: false,
		},
	},

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
