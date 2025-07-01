import type { Crew, Task, TasksAssignment } from "@/lib/db/schema";

export type TaskWithRelations = Task & {
	booking: { name: string };
	tasksAssignments: Array<
		TasksAssignment & {
			crew: Crew & {
				member?: {
					user?: {
						name?: string | null;
					} | null;
				} | null;
			};
		}
	>;
};
