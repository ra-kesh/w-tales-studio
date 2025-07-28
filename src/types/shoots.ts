import type { Crew, Member, Shoot, ShootsAssignment, User } from "@/lib/db/schema";

export interface ShootAdditionalDetails {
	additionalServices?: string[];
	requiredCrewCount?: string;
}

export type ShootData = Omit<Shoot, "additionalDetails"> & {
	additionalDetails?: ShootAdditionalDetails | null;
};

type CrewWithDetails = Crew & {
	member?: (Member & { user: Pick<User, "id" | "name" | "email"> | null }) | null;
};

export type ShootsAssignmentWithCrew = ShootsAssignment & {
	crew: CrewWithDetails;
};

export type ShootRowData = ShootData & {
	booking: { name: string };
	shootsAssignments: ShootsAssignmentWithCrew[];
};

export interface ShootsResponse {
	data: ShootRowData[];
	total: number;
	pageCount: number;
	limit: number;
}
