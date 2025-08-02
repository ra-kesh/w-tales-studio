import "server-only";

import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (
	!process.env.AWS_S3_BUCKET_NAME ||
	!process.env.AWS_REGION ||
	!process.env.AWS_ACCESS_KEY_ID ||
	!process.env.AWS_SECRET_ACCESS_KEY
) {
	throw new Error("Missing required AWS S3 environment variables.");
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	endpoint: process.env.AWS_ENDPOINT_URL_S3,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
	forcePathStyle: false,
	// If you are using a provider other than AWS S3, like Cloudflare R2,
	// you need to specify the endpoint URL.
	// endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`,
});

/**
 * Generates a presigned URL for uploading a file directly to S3.
 * @param key The unique key (path/filename) for the object in S3.
 * @param contentType The MIME type of the file being uploaded.
 * @param expiresIn The duration in seconds for which the URL is valid. Defaults to 300 (5 minutes).
 * @returns A promise that resolves to the presigned URL.
 */
export async function getUploadUrl(
	key: string,
	contentType: string,
	expiresIn = 300,
): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType,
	});

	const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
	return signedUrl;
}

/**
 * Generates a presigned URL for securely downloading a private file from S3.
 * @param key The unique key (path/filename) of the object in S3.
 * @param expiresIn The duration in seconds for which the URL is valid. Defaults to 3600 (1 hour).
 * @returns A promise that resolves to the presigned URL.
 */
export async function getDownloadUrl(
	key: string,
	expiresIn = 3600,
): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
	return signedUrl;
}

/**
 * Deletes an object from the S3 bucket.
 * @param key The unique key (path/filename) of the object to delete.
 */
export async function deleteObject(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	await s3Client.send(command);
}
