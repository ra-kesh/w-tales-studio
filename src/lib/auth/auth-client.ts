import { createAuthClient } from "better-auth/react";
import {
	adminClient,
	multiSessionClient,
	oneTapClient,
	organizationClient,
	usernameClient,
} from "better-auth/client/plugins";
import { toast } from "sonner";

export const authClient = createAuthClient({
	plugins: [
		organizationClient(),
		usernameClient(),
		adminClient(),
		multiSessionClient(),
		oneTapClient({
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
			autoSelect: false,
			cancelOnTapOutside: true,
			context: "signin",
			promptOptions: {
				baseDelay: 1000, // Base delay in ms (default: 1000)
				maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
			},
		}),
	],
	fetchOptions: {
		onError: (ctx) => {
			toast.error(ctx.error.message);
		},
	},
});

export const {
	signUp,
	signIn,
	signOut,
	useSession,
	organization,
	useListOrganizations,
	useActiveOrganization,
} = authClient;
