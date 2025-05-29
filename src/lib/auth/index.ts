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
import { reactResetPasswordEmail } from "../email/resetPassword";

const from = process.env.BETTER_AUTH_EMAIL || "mail@updates.rakyesh.com";
const to = process.env.TEST_EMAIL || "";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
	emailVerification: {
		async sendVerificationEmail({ user, url }) {
			const res = await resend.emails.send({
				from,
				to: to || user.email,
				subject: "Verify your email address",
				html: `<a href="${url}">Verify your email address</a>`,
			});
			console.log(res, user.email);
		},
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword({ user, url }) {
			await resend.emails.send({
				from,
				to: user.email,
				subject: "Reset your password",
				react: reactResetPasswordEmail({
					username: user.email,
					resetLink: url,
				}),
			});
		},
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
								? `http://localhost:3000/sign-in?redirect=/accept-invitation/${data.id}`
								: `${
										process.env.BETTER_AUTH_URL || "https://wtp.rakyesh.com"
									}/sign-in?redirect=/accept-invitation/${data.id}`,
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
	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
			disableIpTracking: false,
		},
	},

	disabledPaths: ["/sign-up/email", "/sign-in/email"],
});
