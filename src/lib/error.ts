export const _statusCode = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	MULTIPLE_CHOICES: 300,
	MOVED_PERMANENTLY: 301,
	FOUND: 302,
	SEE_OTHER: 303,
	NOT_MODIFIED: 304,
	TEMPORARY_REDIRECT: 307,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	PAYLOAD_TOO_LARGE: 413,
	URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	"I'M_A_TEAPOT": 418,
	MISDIRECTED_REQUEST: 421,
	UNPROCESSABLE_ENTITY: 422,
	LOCKED: 423,
	FAILED_DEPENDENCY: 424,
	TOO_EARLY: 425,
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	VARIANT_ALSO_NEGOTIATES: 506,
	INSUFFICIENT_STORAGE: 507,
	LOOP_DETECTED: 508,
	NOT_EXTENDED: 510,
	NETWORK_AUTHENTICATION_REQUIRED: 511,
};

export type Status =
	| 100
	| 101
	| 102
	| 103
	| 200
	| 201
	| 202
	| 203
	| 204
	| 205
	| 206
	| 207
	| 208
	| 226
	| 300
	| 301
	| 302
	| 303
	| 304
	| 305
	| 306
	| 307
	| 308
	| 400
	| 401
	| 402
	| 403
	| 404
	| 405
	| 406
	| 407
	| 408
	| 409
	| 410
	| 411
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 421
	| 422
	| 423
	| 424
	| 425
	| 426
	| 428
	| 429
	| 431
	| 451
	| 500
	| 501
	| 502
	| 503
	| 504
	| 505
	| 506
	| 507
	| 508
	| 510
	| 511;

export class APIError extends Error {
	constructor(
		public status: keyof typeof _statusCode | Status = "INTERNAL_SERVER_ERROR",
		public body:
			| ({
					message?: string;
					code?: string;
			  } & Record<string, any>)
			| undefined = undefined,
		public headers: HeadersInit = {},
		public statusCode = typeof status === "number"
			? status
			: _statusCode[status],
	) {
		super(body?.message);
		this.name = "APIError";
		this.status = status;
		this.headers = headers;
		this.statusCode = statusCode;
		this.body = body
			? {
					code: body?.message
						?.toUpperCase()
						.replace(/ /g, "_")
						.replace(/[^A-Z0-9_]/g, ""),
					...body,
				}
			: undefined;
		this.stack = "";
	}
}

// export const ORGANIZATION_ERROR_CODES = {
// 	YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION:
// 		"You are not allowed to create a new organization",
// 	YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS:
// 		"You have reached the maximum number of organizations",
// 	ORGANIZATION_ALREADY_EXISTS: "Organization already exists",
// 	ORGANIZATION_NOT_FOUND: "Organization not found",
// 	USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION:
// 		"User is not a member of the organization",
// 	YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION:
// 		"You are not allowed to update this organization",
// 	YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION:
// 		"You are not allowed to delete this organization",
// 	NO_ACTIVE_ORGANIZATION: "No active organization",
// 	USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION:
// 		"User is already a member of this organization",
// 	MEMBER_NOT_FOUND: "Member not found",
// 	ROLE_NOT_FOUND: "Role not found",
// 	YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM:
// 		"You are not allowed to create a new team",
// 	TEAM_ALREADY_EXISTS: "Team already exists",
// 	TEAM_NOT_FOUND: "Team not found",
// 	YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
// 		"You cannot leave the organization as the only owner",
// 	YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER:
// 		"You are not allowed to delete this member",
// 	YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
// 		"You are not allowed to invite users to this organization",
// 	USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION:
// 		"User is already invited to this organization",
// 	INVITATION_NOT_FOUND: "Invitation not found",
// 	YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION:
// 		"You are not the recipient of the invitation",
// 	YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION:
// 		"You are not allowed to cancel this invitation",
// 	INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION:
// 		"Inviter is no longer a member of the organization",
// 	YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE:
// 		"you are not allowed to invite user with this role",
// 	FAILED_TO_RETRIEVE_INVITATION: "Failed to retrieve invitation",
// 	YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS:
// 		"You have reached the maximum number of teams",
// 	UNABLE_TO_REMOVE_LAST_TEAM: "Unable to remove last team",
// 	YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER:
// 		"You are not allowed to update this member",
// 	ORGANIZATION_MEMBERSHIP_LIMIT_REACHED:
// 		"Organization membership limit reached",
// 	YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION:
// 		"You are not allowed to create teams in this organization",
// 	YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION:
// 		"You are not allowed to delete teams in this organization",
// 	YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM:
// 		"You are not allowed to update this team",
// 	YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM:
// 		"You are not allowed to delete this team",
// 	INVITATION_LIMIT_REACHED: "Invitation limit reached",
// 	TEAM_MEMBER_LIMIT_REACHED: "Team member limit reached",
// } as const;
