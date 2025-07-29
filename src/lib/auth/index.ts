import "server-only";

import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
	admin,
	customSession,
	multiSession,
	oneTap,
	organization,
	username,
} from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { getActiveOrganization } from "../db/queries";
import { members } from "../db/schema";
import { reactInvitationEmail } from "../email/invitation";
import { resend } from "../email/resend";
import { reactResetPasswordEmail } from "../email/resetPassword";
import {
	ac,
	appRoles,
	crew,
	hr,
	manager,
	member,
	owner,
	post_production_manager,
	studio_admin,
} from "./permission";

const from = process.env.BETTER_AUTH_EMAIL || "mail@updates.rakyesh.com";
const to = process.env.TEST_EMAIL || "";

const options = {
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
			ac,
			roles: appRoles,
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
										process.env.BETTER_AUTH_URL || "https://studsol.com"
									}/sign-in?redirect=/accept-invitation/${data.id}`,
					}),
				});
			},
			allowUserToCreateOrganization: false,
		}),
		nextCookies(),
		multiSession(),
		oneTap(),
		admin({
			adminUserIds: [
				"CjPJYdx1f6Sv56bKksTXH0LOzfdRQKbN",
				"IBK8WyEDfhPGjzmmt5TLSQ4Xe2TqEElK",
			],
		}),
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
				before: async (sessionInput) => {
					const activeOrgInfo = await getActiveOrganization(
						sessionInput.userId,
					);
					const activeOrganizationId = activeOrgInfo
						? activeOrgInfo.organizationId
						: null;
					return {
						data: {
							...sessionInput,
							activeOrganizationId: activeOrganizationId,
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
} satisfies BetterAuthOptions;

export const auth = betterAuth({
	...options,
	plugins: [
		...(options.plugins ?? []),
		customSession(async ({ user, session }) => {
			const roles = await findUserRoles(
				session.userId,
				session.activeOrganizationId,
			);

			return {
				roles,
				user,
				session,
			};
		}, options),
	],
});

async function findUserRoles(
	userId: string,
	activeOrganizationId: string | null | undefined,
): Promise<string[]> {
	if (!activeOrganizationId) {
		return [];
	}
	const memberships = await db
		.select({ role: members.role })
		.from(members)
		.where(
			and(
				eq(members.userId, userId),
				eq(members.organizationId, activeOrganizationId),
			),
		);
	return memberships
		.map((membership) => membership.role)
		.filter((role) => role != null) as string[];
}
