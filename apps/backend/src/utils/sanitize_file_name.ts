import randomString from "./random_string";

/**
 * Sanitizes a file name by replacing spacing and special characters with underscores.
 * only allowing alphanumeric characters, dots, underscores, and hyphens.
 * and add random string to the end of the file name to avoid collisions.
 * @param fileName - the original file name
 * @returns - the sanitized file name
 */
export default function sanitizeFileName(fileName: string): string {
	const extensionIndex = fileName.lastIndexOf(".");
	const namePart =
		extensionIndex !== -1 ? fileName.substring(0, extensionIndex) : fileName;
	const extensionPart =
		extensionIndex !== -1 ? fileName.substring(extensionIndex) : "";

	// Replace spaces and special characters with underscores
	const sanitizedBaseName = namePart
		.replace(/[^a-zA-Z0-9._-]/g, "_")
		.replace(/_+/g, "_") // Replace multiple underscores with a single one
		.replace(/^_+|_+$/g, ""); // Trim leading and trailing underscores

	// Append a random string to avoid collisions
	const randomSuffix = randomString(3);

	return `${sanitizedBaseName}_${randomSuffix}${extensionPart}`;
}
