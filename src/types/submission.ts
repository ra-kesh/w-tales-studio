// lib/types.ts

// Type for a single file associated with a submission
export interface SubmissionFile {
	id: number;
	submissionId: number;
	fileName: string;
	filePath: string; // This is the full URL
	fileSize: number;
	mimeType: string | null;
	uploadedBy: number;
	uploadedAt: string;
}

// The complete type for a submission object returned by our API
export interface SubmissionWithRelations {
	id: number;
	assignmentType: "task" | "deliverable";
	assignmentId: number;
	version: number;
	status: string;
	comment: string | null;
	powLinks: string[];
	submittedBy: {
		name: string;
	};
	submittedAt: string;
	reviewedBy: {
		name: string;
	} | null;
	reviewComment: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
	currentReviewer: {
		id: number;
		name: string;
	} | null;
	files: SubmissionFile[];
}
