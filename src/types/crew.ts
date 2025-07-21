export interface UserType {
	name: string;
	email: string;
	image: string | null;
}

export interface MemberType {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: string;
	user: UserType;
}

export interface CrewWithMember {
	id: number;
	memberId: string | null;
	name: string | null;
	email: string | null;
	phoneNumber: string | null;
	equipment: string[] | null;
	role: string | null;
	specialization: string | null;
	status: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	member: MemberType | null;
}
