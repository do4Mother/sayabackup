export function sanitizeFilename(filename: string): string {
  return filename.replace(/[/\\\s]+/g, "_");
}