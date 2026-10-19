import { defineMiddleware } from 'astro:middleware';
import { createContentReader, isSessionPreview } from './lib/plume';

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
	// Public builds use immutable CDN URLs; private preview images use the session gateway.
	if (isSessionPreview && url.pathname.startsWith('/plume/media/')) {
		const response = await createContentReader().handleMedia(request);
		if (response) return response;
	}
	return next();
});
