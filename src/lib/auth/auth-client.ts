import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { toast } from "sonner";
import { admin, username } from "better-auth/plugins";

export const authClient = createAuthClient({
  plugins: [organizationClient(), username(), admin()],
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});

export const { useSession, signOut } = authClient;
