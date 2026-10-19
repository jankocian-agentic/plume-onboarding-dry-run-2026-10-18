import type { ContentItem, DeliveredCollection } from '@plume-press/sdk';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import firstImage from '../assets/blog-placeholder-3.jpg';
import secondImage from '../assets/blog-placeholder-4.jpg';
import thirdImage from '../assets/blog-placeholder-2.jpg';
import guideImage from '../assets/blog-placeholder-1.jpg';
import mdxImage from '../assets/blog-placeholder-5.jpg';
import inlineImage from '../assets/blog-placeholder-about.jpg';
import type { schema } from '../../plume.schema';
import type { ContentReader } from './plume';

export type BlogItem = ContentItem<DeliveredCollection<typeof schema, 'blog'>>;

// Keep the imported posts' original artwork until an editor chooses a CMS image.
const originalImages = new Map([
	['01a1518a-e407-72d0-a8c2-de3b82ac1fd2', firstImage],
	['01a1518a-ffbf-7360-9052-cc2d4b9f8d47', secondImage],
	['01a1518a-b61d-7119-96bb-a4774af9ca0d', thirdImage],
	['01a1518b-1f38-7426-b513-a966f2f57bfb', guideImage],
	['01a1518b-2e46-71ca-a56c-80305aba0f8c', mdxImage],
]);

export function blogPost(item: BlogItem) {
	return {
		id: item.id,
		...item.data,
		pubDate: new Date(item.data.pubDate),
		heroImage: item.data.heroImage?.url ?? originalImages.get(item.id),
		heroAlt: item.data.heroImage?.alt ?? '',
	};
}

export type BlogPost = ReturnType<typeof blogPost>;

export async function getBlogPosts(reader: ContentReader): Promise<BlogPost[]> {
	const items: BlogItem[] = [];
	let offset = 0;
	while (true) {
		const page = await reader.collection('blog').list({ offset, limit: 50 });
		items.push(...page.items);
		offset += page.items.length;
		if (offset >= page.total) break;
		if (page.items.length === 0) throw new Error('Plume returned an incomplete blog page.');
	}
	return items.map(blogPost).sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export function renderPostText(body: string) {
	// The initial CMS import contains Markdown; subsequent rich-text edits contain HTML.
	const html = marked.parse(body.replaceAll('../../assets/blog-placeholder-about.jpg', inlineImage.src), {
		async: false,
	});
	return sanitizeHtml(html, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			img: ['src', 'alt', 'width', 'height', 'loading'],
			div: ['data-youtube-video'],
			iframe: ['src', 'title', 'loading', 'referrerpolicy', 'sandbox', 'allowfullscreen'],
		},
		allowedIframeHostnames: ['www.youtube-nocookie.com'],
		allowedSchemesByTag: { iframe: ['https'] },
	});
}
