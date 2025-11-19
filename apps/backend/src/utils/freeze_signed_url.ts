const inMemoryCache = new Map<string, { url: string; expires: number }>();

/**
 * Freezes regenerate signed URL by checking inMemoryCache
 */
export async function freezeSignedUrl(data: {
	url: string;
	ttlSeconds: number;
	newUrlCallback?: () => string | Promise<string>;
}): Promise<string> {
	const now = Date.now();
	const cacheEntry = inMemoryCache.get(data.url);

	if (cacheEntry && cacheEntry.expires > now) {
		return cacheEntry.url;
	}

	const expires = now + data.ttlSeconds * 1000;
	const newUrl = await Promise.resolve(
		data.newUrlCallback ? data.newUrlCallback() : data.url,
	);
	inMemoryCache.set(data.url, { url: newUrl, expires });

	return newUrl;
}
