import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db } from "../db/drizzle";
import { admin, organization, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

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
      allowUserToCreateOrganization: false,
    }),
    nextCookies(),
  ],
});
