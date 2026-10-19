import { createPlume, createRenderEvidence, serializeRenderEvidence } from '@plume-press/sdk';
import configuration from 'virtual:plume-config';
import { schema } from '../../plume.schema';

// This module is used only by Astro's server-side pages and middleware.
export function createContentReader() {
	return createPlume({
		schema,
		binding: configuration.binding,
		endpoint: configuration.endpoint,
		mode: configuration.mode,
	});
}

export type ContentReader = ReturnType<typeof createContentReader>;

export function renderEvidence(reader: ContentReader) {
	return configuration.descriptor
		? serializeRenderEvidence(createRenderEvidence(reader, configuration.descriptor, 'static'))
		: null;
}

export const isSessionPreview = configuration.mode === 'preview';
