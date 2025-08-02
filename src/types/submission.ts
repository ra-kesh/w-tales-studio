// lib/types.ts

// A tiny Booking stub
export interface BookingStub {
	id: number;
	name: string;
}

// Task “stub” with both .description (required) and optional .title
export interface TaskStub {
	id: number;
	bookingId: number;
	organizationId: string;
	deliverableId: number | null;
	status: string;
	description: string; // used by TaskCard
	title?: string; // make this optional so DeliverableCard can fallback
	priority: string;
	startDate: string | null;
	dueDate: string | null;
	createdAt: string;
	updatedAt: string;
	workflowStatus: string | null;
	approvedSubmissionId: number | null;
	approvedAt: string | null;
	lastStatusUpdateBy: number | null;
	lastStatusUpdatedAt: string | null;
	booking: BookingStub;
}

// Deliverable “stub” with both .title (required) and optional .description
export interface DeliverableStub {
	id: number;
	bookingId: number;
	organizationId: string;
	title: string; // used by DeliverableCard
	description?: string; // make this optional so TaskCard can fallback
	isPackageIncluded: boolean;
	cost: string;
	quantity: number;
	dueDate: string | null;
	notes: string | null;
	status: string;
	priority: string;
	fileUrl: string | null;
	clientFeedback: string | null;
	revisionCount: number;
	deliveredAt: string | null;
	createdAt: string;
	updatedAt: string;
	workflowStatus: string | null;
	approvedSubmissionId: number | null;
	approvedAt: string | null;
	lastStatusUpdateBy: number | null;
	lastStatusUpdatedAt: string | null;
	booking: BookingStub;
}

// The file shape you already had:
export interface SubmissionFile {
	id: number;
	submissionId: number;
	fileName: string;
	filePath: string;
	fileSize: number;
	mimeType: string | null;
	uploadedBy: number;
	uploadedAt: string;
}

// And the full submission type:
export interface SubmissionWithRelations {
	id: number;
	assignmentType: "task" | "deliverable";
	assignmentId: number;
	version: number;
	status: string;
	comment: string | null;
	powLinks: string[];
	submittedBy: { id: number; name: string; email: string };
	submittedAt: string;
	reviewedBy: { name: string } | null;
	reviewComment: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
	currentReviewer: { id: number; name: string } | null;
	task: TaskStub | null; // now has optional .title
	deliverable: DeliverableStub | null; // now has optional .description
	files: SubmissionFile[];
}
