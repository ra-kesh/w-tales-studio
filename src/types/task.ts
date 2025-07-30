import type {
	Booking,
	Crew,
	Deliverable,
	Task,
	TasksAssignment,
} from "@/lib/db/schema";

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
	deliverable: { title: string };
};

export type TaskAssignmentWithRelations = {
	id: number;
	taskId: number;
	crewId: number;
	organizationId: string;
	assignedAt: string;
	assignedBy: number | null;
	createdAt: string;
	updatedAt: string;
	task: Task & {
		booking: Pick<Booking, "id" | "name">;
		deliverable: Pick<Deliverable, "id" | "title"> | null;
	};
};
