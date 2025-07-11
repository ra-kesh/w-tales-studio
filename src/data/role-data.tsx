export interface ParticipantRole {
	value: string;
	label: string;
}

// This is the single source of truth for all possible participant roles.
export const participantRoles: ParticipantRole[] = [
	{ value: "client", label: "Client" },
	{ value: "bride", label: "Bride" },
	{ value: "groom", label: "Groom" },
	{ value: "mother", label: "Mother" },
	{ value: "partner", label: "Partner" },
	{ value: "family", label: "Family" },
	{ value: "birthday_person", label: "Birthday Person" },
	{ value: "host", label: "Host" },
	{ value: "baby", label: "Baby" },
	{ value: "parent", label: "Parent" },
	{ value: "sibling", label: "Sibling" },
	{ value: "brand", label: "Brand" },
	{ value: "company", label: "Company" },
	{ value: "contact", label: "Point of Contact" },
	{ value: "agency", label: "Agency" },
	{ value: "team", label: "Team" },
	{ value: "planner", label: "Planner" },
	{ value: "other", label: "Other" },
];
