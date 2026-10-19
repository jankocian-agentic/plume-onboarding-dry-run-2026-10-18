// @ts-check

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { contentBindingSchema, deliveryDescriptorSchema } from '@plume-press/sdk/protocol';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// Compile the content mode once; a deployed static build must never switch to latest.
function plumeConfiguration() {
	const moduleId = 'virtual:plume-config';
	return {
		name: 'plume-configuration',
		resolveId(id) {
			return id === moduleId ? `\0${moduleId}` : undefined;
		},
		load(id) {
			if (id !== `\0${moduleId}`) return;
			const read = (path) => {
				const filename = fileURLToPath(new URL(path, import.meta.url));
				this.addWatchFile(filename);
				return JSON.parse(readFileSync(filename, 'utf8'));
			};
			const binding = contentBindingSchema.parse(read('./.plume/binding.json'));
			const preview = process.env.PLUME_PREVIEW === 'true';
			if (preview && !process.env.PLUME_ENDPOINT) {
				throw new Error('PLUME_ENDPOINT is required for a private Plume preview.');
			}
			const descriptor = preview
				? null
				: deliveryDescriptorSchema.parse(read('./.plume/delivery.json'));
			if (descriptor && (descriptor.mode !== 'static' ||
				JSON.stringify(descriptor.binding) !== JSON.stringify(binding))) {
				throw new Error('This static site requires a matching plume build --delivery static binding.');
			}
			return `export default ${JSON.stringify({
				binding,
				mode: preview ? 'preview' : 'published',
				endpoint: preview ? process.env.PLUME_ENDPOINT : process.env.PLUME_CONTENT_ENDPOINT,
				descriptor,
			})};`;
		},
	};
}

// https://astro.build/config
export default defineConfig({
	vite: { plugins: [plumeConfiguration()] },
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
