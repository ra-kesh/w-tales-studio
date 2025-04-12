import { Tabs } from "@/components/ui/tabs";
import { TeamTabs } from "./_components/team-tabs";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
// import { getTeamMembers } from "@/lib/db/queries";
import { getServerSession } from "@/lib/dal";

export default async function TeamsPage() {
  const { session } = await getServerSession();
  const queryClient = new QueryClient();

  //   await queryClient.prefetchQuery({
  //     queryKey: ["team-members"],
  //     queryFn: () => getTeamMembers(session?.session.activeOrganizationId as string),
  //   });

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TeamTabs />
      </HydrationBoundary>
    </div>
  );
}
